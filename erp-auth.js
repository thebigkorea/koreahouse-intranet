const ERP_AUTH_API = "https://script.google.com/macros/s/AKfycbyczBpNvw5SH3o9jFZ6ZdW6i-ro6CfNDqG-xwiB9GKVyAybKF4d6PyN9ACF_ukHM7sr/exec";

const ERP_AUTH_TOKEN_KEY = "thebigkorea_erp_session";
const ERP_AUTH_EXPIRES_KEY = "thebigkorea_erp_session_expires";

// 로그인 유지시간: 12시간
const ERP_AUTH_DURATION = 12 * 60 * 60 * 1000;


/* =========================================================
   인증 서버 요청
========================================================= */

async function erpAuthRequest(payload){
  const response = await fetch(ERP_AUTH_API, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "Content-Type":"text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if(!response.ok){
    throw new Error("인증 서버 연결 실패");
  }

  return await response.json();
}


/* =========================================================
   로그인 정보 관리
   - localStorage 사용
   - 새로고침 / 브라우저 재실행 / 새 탭에서도 12시간 유지
========================================================= */

function erpSaveSession(token){
  const expiresAt = Date.now() + ERP_AUTH_DURATION;
  localStorage.setItem(ERP_AUTH_TOKEN_KEY, token);
  localStorage.setItem(ERP_AUTH_EXPIRES_KEY, String(expiresAt));
}

function erpGetToken(){
  const token = localStorage.getItem(ERP_AUTH_TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(ERP_AUTH_EXPIRES_KEY) || 0);

  if(!token){
    return null;
  }

  // 브라우저 보관시간 12시간이 실제로 지난 경우에만 삭제
  if(!expiresAt || Date.now() >= expiresAt){
    erpClearSession();
    return null;
  }

  return token;
}

function erpClearSession(){
  localStorage.removeItem(ERP_AUTH_TOKEN_KEY);
  localStorage.removeItem(ERP_AUTH_EXPIRES_KEY);
}


/* =========================================================
   로그인 화면 표시
========================================================= */

function erpShowLogin(message=""){
  document.documentElement.classList.remove("erp-auth-checking");
  document.documentElement.classList.add("erp-auth-pending");

  const gate = document.getElementById("erpLoginGate");
  const msg = document.getElementById("erpLoginMessage");
  const logout = document.getElementById("erpLogoutButton");

  if(gate) gate.hidden = false;
  if(msg) msg.textContent = message;
  if(logout) logout.hidden = true;
}


/* =========================================================
   ERP 화면 잠금 해제
========================================================= */

function erpUnlock(){
  document.documentElement.classList.remove("erp-auth-checking");
  const gate = document.getElementById("erpLoginGate");
  const logout = document.getElementById("erpLogoutButton");

  if(gate) gate.hidden = true;
  if(logout) logout.hidden = false;

  document.documentElement.classList.remove("erp-auth-pending");
}


/* =========================================================
   메인 ERP 로그인 상태 확인

   중요:
   - 로컬 토큰이 유효하면 우선 ERP 화면을 유지한다.
   - 서버 verify가 일시적으로 실패했다고 토큰을 삭제하지 않는다.
   - 서버가 명확하게 "인증 만료/실패"라고 응답할 때만 삭제한다.
========================================================= */

async function erpVerifySession(){
  const token = erpGetToken();

  if(!token){
    erpShowLogin();
    return;
  }

  // 새로고침 시 로그인 화면이 번쩍 나타나지 않도록 우선 잠금 해제
  erpUnlock();

  try{
    const data = await erpAuthRequest({
      action:"verify",
      token:token
    });

    if(data && data.ok && data.authenticated){
      return;
    }

    // 서버가 정상 응답했지만 인증이 실제로 거절된 경우에만 세션 제거
    if(data && data.ok === true && data.authenticated === false){
      erpClearSession();
      erpShowLogin(
        (data && data.message) ||
        "로그인 시간이 만료되었습니다. 다시 로그인해 주세요."
      );
    }

  }catch(e){
    // 네트워크/Apps Script 일시 오류 때문에 사용자를 강제 로그아웃하지 않는다.
    console.warn(
      "ERP 인증 서버 확인이 일시적으로 실패했습니다. 기존 로그인 상태를 유지합니다.",
      e
    );
  }
}


/* =========================================================
   로그인
========================================================= */

async function erpLogin(event){
  event.preventDefault();

  const id = document.getElementById("erpLoginId");
  const pw = document.getElementById("erpLoginPassword");
  const btn = document.getElementById("erpLoginButton");
  const msg = document.getElementById("erpLoginMessage");

  if(!id || !pw || !btn){
    return;
  }

  btn.disabled = true;
  btn.textContent = "확인 중...";

  if(msg){
    msg.textContent = "";
  }

  try{
    const data = await erpAuthRequest({
      action:"login",
      userId:id.value.trim(),
      password:pw.value
    });

    // 비밀번호는 즉시 화면에서 삭제
    pw.value = "";

    if(data && data.ok && data.token){
      erpSaveSession(data.token);
      id.value = "";
      erpUnlock();
      return;
    }

    if(msg){
      msg.textContent =
        (data && data.message) ||
        "로그인에 실패했습니다.";
    }

  }catch(e){
    console.error("ERP 로그인 실패", e);

    if(msg){
      msg.textContent =
        "인증 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

  }finally{
    btn.disabled = false;
    btn.textContent = "로그인";
  }
}


/* =========================================================
   로그아웃
========================================================= */

async function erpLogout(){
  const token = erpGetToken();

  // 사용자가 로그아웃을 누른 경우에만 브라우저 인증정보 즉시 제거
  erpClearSession();

  erpShowLogin("로그아웃되었습니다.");

  try{
    if(token){
      await erpAuthRequest({
        action:"logout",
        token:token
      });
    }
  }catch(e){
    console.error("ERP 로그아웃 서버 처리 실패", e);
  }
}


/* =========================================================
   메인 index.html 이벤트
========================================================= */

document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("erpLoginForm");
  const logout = document.getElementById("erpLogoutButton");

  if(form){
    form.addEventListener("submit", erpLogin);
  }

  if(logout){
    logout.addEventListener("click", erpLogout);
  }

  erpVerifySession();
});


/* =========================================================
   ERP 내부 페이지 직접접속 보호
========================================================= */

(function protectErpInternalPage(){
  const path = window.location.pathname;
  const fileName = path.split("/").pop().toLowerCase();

  const ERP_PUBLIC_PAGES = [
    "contract-view.html",
    "contract-complete.html",
    "daily-worker.html"
  ];

  // 메인 로그인 페이지 + 공개 페이지는 인증 제외
  if(
    fileName === "" ||
    fileName === "index.html" ||
    ERP_PUBLIC_PAGES.includes(fileName)
  ){
    return;
  }

  // 내부 페이지는 인증 확인 전 잠깐 숨김
  document.documentElement.style.visibility = "hidden";

  async function verifyInternalPage(){
    const token = erpGetToken();

    // 토큰 자체가 없거나 로컬 12시간이 만료된 경우
    if(!token){
      window.location.replace("./index.html");
      return;
    }

    try{
      const data = await erpAuthRequest({
        action:"verify",
        token:token
      });

      if(data && data.ok && data.authenticated){
        document.documentElement.style.visibility = "";
        return;
      }

      // 서버가 명확히 인증 실패를 반환한 경우
      if(data && data.ok === true && data.authenticated === false){
        erpClearSession();
        window.location.replace("./index.html");
        return;
      }

      // 애매한 서버 응답은 일시 오류로 보고 기존 세션 유지
      console.warn("ERP 인증 응답이 불완전하여 기존 세션을 유지합니다.", data);
      document.documentElement.style.visibility = "";

    }catch(error){
      // 서버 통신 장애만으로 사용자를 로그인 화면으로 보내지 않음
      console.warn(
        "ERP 내부 페이지 인증 서버 연결 실패 - 기존 로그인 상태 유지",
        error
      );
      document.documentElement.style.visibility = "";
    }
  }

  verifyInternalPage();
})();
