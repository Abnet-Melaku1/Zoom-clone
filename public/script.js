// navigator.mediaDevices.getUserMedia({ video: true, audio: true });
let myVideoStream;
const socket = io("/");
const peers = {};
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    /* use the stream */
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    // input value
    let text = document.querySelector("#chat_message");
    console.log(document.querySelector("html"));
    document.querySelector("html").addEventListener("keydown", function (e) {
      if (e.which == 13 && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      // scrollToBottom();
    });
  })
  .catch((err) => {
    /* handle the error */
  });
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});
myPeer.on("open", (id) => {
  socket.emit("join-room", roomId, id);
  console.log(id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (remoteStream) => {
    // Show stream in some video/canvas element.
    addVideoStream(video, remoteStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
  };
  videoGrid.append(video);
}
const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
const leave = document.querySelector(".leave_meeting");
leave.addEventListener("click", () => {
  open(location, "_self").close();
  console.log("sdhkfh");
});
// const closeWindow = () => {
//   window.close();
// };
