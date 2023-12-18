// ユーザー登録
function register() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var username = document.getElementById('username').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            // 登録成功時の処理
            console.log("User registered:", user);
            
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // エラー時の処理
            console.error("Registration failed:", errorCode, errorMessage);
            alert("登録できませんでした。");
        });
    
    // ユーザー情報をFirestoreに保存
    var db = firebase.firestore();
    db.collection('users').add({
        username: username,
    })
}

// ログイン
function login() {
    var email = document.getElementById('mail').value;
    var password = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            // ログイン成功時の処理
            console.log("User logged in:", user);
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            // エラー時の処理
            console.error("Login failed:", errorCode, errorMessage);
            alert("ログインできませんでした。");
        });
}


