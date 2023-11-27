const database = firebase.database();
const API_KEY = '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';
const URL = "https://api.openai.com/v1/chat/completions";

//問題文生成
async function genelate() {
    database.ref("lateral-thinking-quiz/question").remove()
    database.ref("messages").remove()
    const Questioncontainer = document.getElementById('chat-container');
    try {
        const response = await axios.post(
            URL,
            {
                "model": "gpt-3.5-turbo",
                "messages": [
                    { "role": "user", "content": "あなたは水平思考ゲームの出題者。「謎の物語」の文章は、それだけでは答えの分からない不可解な出来事の情景を説明した文章で、締めくくりは「なぜだろう？」等の疑問形の一言で終わる。「タイトル」「謎の物語」と「答え」を以下の形で出題して。「タイトル」「謎の物語」「答え」" }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );
        var chatgpt_response = response.data.choices[0].message.content;
    } catch (error) {
        console.log(error);
    }
        database.ref('lateral-thinking-quiz/question').set({
            text: chatgpt_response
        });
    
    database.ref('lateral-thinking-quiz/question').once('value').then(async snapshot => {
        const text = snapshot.val();
        console.log(text);
        console.log(text.text);
        try {
            const response = await axios.post(
                URL,
                {
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        { "role": "system", "content": "「答え」を除いて、「タイトル」と「謎の物語」のみを出力して" },
                        { "role": "user", "content": text.text }
                    ]
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                }
            );
            var chatgpt_response = response.data.choices[0].message.content;
        } catch (error) {
            console.log(error);
        }
        console.log(chatgpt_response);
        Questioncontainer.innerHTML = chatgpt_response;
    });

}
async function getResponse(message) {
    const snapshot = await database.ref('lateral-thinking-quiz/question').once('value');

    // .then(async snapshot => {
        const text = snapshot.val();
        console.log(text.text)
    // });
    try {
        const response = await axios.post(
            URL,
            {
                "model": "gpt-4-1106-preview",
                "messages": [
                    { "role": "system", "content": "あなたは水平思考ゲームの出題者。参加者は「謎の物語」を聞き、答えを見つける為に出題者へさまざまな質問を行う。出題者は「タイトル」「謎の物語」と「答え」に基づき、参加者からの質問を受けて、参加者を「答え」へ導くように「はい」「いいえ」「関係ありません」の択でのみ回答しそれ以外の回答は行わないやり取りを繰り返す事で徐々に答えが絞られていき、最終的に参加者が答えを言い当てると、その問題はクリアとなり終了する。出題者が質問を受けた時、「いいえ」と答えるのは答えの方向性は合っているが明確にNOと言える場合。「関係ありません」と答えるのは、その質問自体が、答えから大きく遠ざかっている内容の時に使う。正解の場合は「正解」と答える。以下、問題と答え" + text.text},
                    { "role": "user", "content": message }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
            }
        );
        var chatgpt_response = response.data.choices[0].message.content;
    } catch (error) {
        console.log(error);
    } 
    return chatgpt_response;       
}
    

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        database.ref('messages').push({
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: "user"
        });

        // メッセージを送信したら入力欄をクリア
        messageInput.value = '';
    }
}

async function Question() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        database.ref('messages').push({
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: "user"
        });

        // メッセージを送信したら入力欄をクリア
        messageInput.value = '';
    }
    const response = await getResponse(message);
    console.log(response)

    if (response.trim() !== '') {
        database.ref('messages').push({
            text: response,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            status: "gpt"
        });
    }
}

// メッセージが追加されたときのリスナー
database.ref('messages').on('child_added', (snapshot) => {
    const message = snapshot.val();
    console.log(message);
    console.log(message.text);
    displayMessage(message.text, message.status);
});

function displayMessage(message, status) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    
    //statusに基づきスタイル変更
    if (status === "user") {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('gpt-message');
    }

    messageElement.textContent = message;
    chatContainer.appendChild(messageElement);
    // チャットコンテナをスクロールして最新メッセージが表示されるようにする
    chatContainer.scrollTop = chatContainer.scrollHeight;
}