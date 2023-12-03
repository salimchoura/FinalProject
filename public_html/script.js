/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains the functions for creating a new user account and 
 * logging in a new user. They communicate with our server (see server.js)
 * and then perform intuitive actions as a result. The function to add a
 * user alerts the user if their account creation is successful, and 
 * logs an error in the console if it is not. The function to log in a
 * user will alert the user if the login was unsuccessful, and redirect
 * the user to the home page if the login was successful. These functions
 * allow the core functionality of adding content to the website, since
 * users cannot post content if they are not logged in.
 */

/*
 * addUser() creates a new user account with the given username and 
 * password. It communicates with the server to ensure that the user has
 * not already been created, and also ensures that the user is saved
 * to the database on the server side. When the user account is created,
 * success will be indicated by the use of an alert.
 * 
 * Author: Nilufer Demirbas
 */
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
        document.getElementById('username').value = "";
        document.getElementById('password').value = "";
    });
    request.catch((error) => {
        console.log("ERROR IN CREATION OF ACCOUNT");
        console.log(error);
    });
}

/**
 * logInUser() logs a user in by communicating with the server. It also
 * collects a cookie that travels with the user throughout their time on the
 * website to ensure that the user remains logged in. If the user's login
 * is successful, they are redirected to the home page. If the user's login
 * failed, then they are alerted of the failure.
 * 
 * Author: Nilufer Demirbas
 */
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
            alert(text);
        }
    });
    request.catch((error) => {
        console.log("ERROR LOGGING IN");
        console.log(error);
    })

}