// function on(userid, title) {
//     document.getElementById("notif").style.display = "block";
//     document.getElementById("nextdelete").setAttribute("href", `users/delete/${userid}`);
//     document.getElementById(
//         "ask"
//     ).innerHTML = `Apakah kamu yakin akan menghapus data '${title}'?`;
//     return false
// }
// function off() {
//     document.getElementById("notif").style.display = "none"
// }


function on(userid, title) {
    document.getElementById("notif").style.display = "block";
    document.getElementById("nextdelete").setAttribute("href", `users/delete/${userid}`);
    document.getElementById(
      "ask"
    ).innerHTML = `Apakah kamu yakin akan menghapus data '${title}'?`;
    return false
  }

  function off() {
    document.getElementById("notif").style.display = "none";
  }