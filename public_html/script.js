// the functions we will be adding
function addUser() {

    // take from text input
    let user = document.getElementById('username').value;
    let pass = document.getElementById('password').value;
    if(user.trim() == "" || pass.trim() == "") {
        // don't add empty username
        return;
    }

    // if the text boxes are not empty, add the new account
    let newAcc = {username: user, password: pass};
    let request = fetch('/add/user', {
        method: 'POST',
        body: JSON.stringify(newAcc),
        headers: { 'Content-Type': 'application/json'}
    });

    request.then((response) => {
        return response.text();
    }).then((text) => {
        // alert the user of the result of their account creation attempt
        alert(text);
    });
    request.catch((error) => {
        console.log("ERROR IN CREATION OF ACCOUNT");
        console.log(error);
    });
}

// needs password matching with hash and salt
function logInUser() {
    // take from text input
    let user = document.getElementById('logUser').value;
    let passVal = document.getElementById('logPW').value;
    if(user.trim() == "" || passVal.trim() == "") {
        // don't try to log in empty username
        return;
    }
    // don't include listings or purchases, not making a new account
    let toLogIn = {username : user, pass : passVal};
    let request = fetch('/login/user', {
        method: 'POST',
        body: JSON.stringify(toLogIn),
        headers: {'Content-Type' : 'application/json'}
    });

    request.then((response) => {
        return response.text();
    }).then((text) => {
        if(text === "SUCCESS") {
            // set current user to the successfully logged-in user
            window.sessionStorage.setItem("username", user);
            // take user to the home page
            window.location.href = '/home.html';
        }
        else {
            // could not log in
            document.getElementById("warning").innerHTML = text;
        }
    });
    request.catch((error) => {
        console.log("ERROR LOGGING IN");
        console.log(error);
    })

}