const API_URL =
  "https://script.google.com/macros/s/AKfycbz-7McT7Z63Z5isCCAAO3VK-kQk2AIOKOMyL9x1SaLtd-hVcyjLIpBOUpm6DUvazoCExw/exec";

const HQ_API_URL =
  "https://script.google.com/macros/s/AKfycby1RoQvXt51KjoasIG-_MmD7SiMau10eRWAYiq4Vk1k2s9yRVsuEBrBVEFvmW7aX765/exec";

document.addEventListener("DOMContentLoaded", function () {
  setDefaultDates();
  loadDashboard();
  loadRecentLogs();
});

function showTab(id, btn) {
  document.querySelectorAll(".panel").forEach(panel => {
    panel.classList.remove("active");
  });

  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
  btn.classList.add("active");

  if (id === "history") {
    loadRecentLogs();
  }
}

function checkApi() {
  if (!API_URL || API_URL.includes("여기에_APPS_SCRIPT")) {
    alert("store-manager.js 상단의 API_URL에 Apps Script 웹앱 주소를 입력하세요.");
    return false;
  }

  return true;
}

async function api(params) {
  if (!checkApi()) throw new Error("API URL 미설정");

  const query = new URLSearchParams(params);
  const res = await fetch(API_URL + "?" + query.toString());

  return await res.json();
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function setDefaultDates() {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const dateText = `${yyyy}-${mm}-${dd}`;

  [
    "dailyDate",
    "employeeDate",
    "customerDate",
    "facilityDate",
    "hygieneDate",
    "complaintDate"
  ].forEach(id => {
    const el = document.getElementById(id);

    if (el && !el.value) {
      el.value = dateText;
    }
  });
}

async function saveLog(payload) {
  try {

    /*
     * 한국의집 원본 매장운영 원장에 저장합니다.
     *
     * 본사 통합 대시보드는 이 원장을 직접 조회하므로
     * HQ_API_URL로 같은 자료를 한 번 더 보낼 필요가 없습니다.
     */
    const data = await api({
      action: "saveStoreDailyLog",
      ...payload
    });

    if (data.success === false) {
      throw new Error(
        data.message ||
        "저장에 실패했습니다."
      );
    }

    alert(
      data.message ||
      "저장되었습니다."
    );

    await loadDashboard();
    await loadRecentLogs();

  } catch (e) {

    console.error(e);

    alert(
      "저장 중 오류가 발생했습니다.\n" +
      e.message
    );
  }
}

function saveDailyReport() {
  saveLog({
    type: "일일보고",
    store: val("dailyStore"),
    date: val("dailyDate"),
    writer: val("dailyWriter"),
    urgency: val("dailyUrgency"),
    title: "일일 운영보고",
    category: "일일보고",
    content: val("dailyIssue"),
    request: val("dailyRequest"),
    extra: val("dailyTomorrow"),
    status: "본사미확인"
  });
}

function saveEmployeeLog() {
  saveLog({
    type: "직원관리",
    store: val("employeeStore"),
    date: val("employeeDate"),
    writer: val("employeeName"),
    urgency: val("employeeUrgency"),
    title: val("employeeType"),
    category: val("employeeType"),
    content: val("employeeMemo"),
    request: "",
    extra: "",
    status: val("employeeStatus")
  });
}

function saveCustomerLog() {
  saveLog({
    type: "고객관리",
    store: val("customerStore"),
    date: val("customerDate"),
    writer: val("customerName"),
    urgency: val("customerUrgency"),
    title: val("customerType"),
    category: val("customerType"),
    content: val("customerMemo"),
    request: val("customerTime"),
    extra: "",
    status: "본사미확인"
  });
}

function saveFacilityLog() {
  saveLog({
    type: "설비관리",
    store: val("facilityStore"),
    date: val("facilityDate"),
    writer: val("facilityCompany"),
    urgency: val("facilityUrgency"),
    title: val("facilityType"),
    category: val("facilityStatus"),
    content: val("facilityMemo"),
    request: "",
    extra: "",
    status: "본사미확인"
  });
}

function saveHygieneLog() {
  saveLog({
    type: "위생점검",
    store: val("hygieneStore"),
    date: val("hygieneDate"),
    writer: val("hygieneChecker"),
    urgency: val("hygieneUrgency"),
    title: val("hygieneType"),
    category: val("hygieneResult"),
    content: val("hygieneMemo"),
    request: "",
    extra: "",
    status: "본사미확인"
  });
}

function saveComplaintLog() {
  saveLog({
    type: "컴플레인",
    store: val("complaintStore"),
    date: val("complaintDate"),
    writer: val("complaintCustomer"),
    urgency: val("complaintUrgency"),
    title: val("complaintType"),
    category: val("complaintStatus"),
    content: val("complaintMemo"),
    request: "",
    extra: "",
    status: val("complaintStatus")
  });
}

async function loadDashboard() {
  try {
    const data = await api({
      action: "getStoreManagerDashboard"
    });

    document.getElementById("todayCount").textContent =
      data.todayCount || 0;

    document.getElementById("urgentCount").textContent =
      data.urgentCount || 0;

    document.getElementById("pendingCount").textContent =
      data.pendingCount || 0;

  } catch (e) {
    console.log(e);
  }
}

async function loadRecentLogs() {
  const box =
    document.getElementById(
      "recentList"
    );

  if (!box) {
    return;
  }

  box.innerHTML = `
    <div class="recent-loading">
      최근내역을 불러오는 중입니다.
    </div>
  `;

  try {

    const data = await api({
      action: "getStoreManagerLogs",
      store: val("historyStore"),
      type: val("historyType"),
      t: Date.now()
    });

    if (data.success === false) {
      throw new Error(
        data.message ||
        "최근내역을 불러오지 못했습니다."
      );
    }

    const logs =
      Array.isArray(data.logs)
        ? data.logs
        : [];

    if (logs.length === 0) {

      box.innerHTML = `
        <div class="recent-loading">
          등록된 내역이 없습니다.
        </div>
      `;

      return;
    }

    box.innerHTML =
      logs.map(log => {

        const urgency =
          String(
            log.urgency ||
            log.priority ||
            "일반"
          ).trim();

        const badgeClass =
          urgency === "긴급"
            ? "urgent"
            : urgency === "중요"
              ? "important"
              : "normal";

        const rawStatus =
          String(
            log.status ||
            log.processStatus ||
            "본사미확인"
          ).trim();

        const normalizedStatus =
          normalizeStoreStatus(
            rawStatus,
            log.hqCheck ||
            log.confirmed ||
            log.confirmStatus
          );

        const statusClass =
          getStoreStatusClass(
            normalizedStatus
          );

        /*
         * 본사 Code.gs는 별도 피드백 열이 없을 경우
         * 추가사항에 아래 형식으로 기록합니다.
         *
         * [본사피드백]
         * 피드백 내용
         */
        const extraText =
          String(
            log.extra ||
            log.additional ||
            log.note ||
            ""
          );

        const directFeedback =
          String(
            log.feedback ||
            log.hqFeedback ||
            ""
          ).trim();

        const feedback =
          directFeedback ||
          extractHeadOfficeFeedback(
            extraText
          );

        const checkedAt =
          log.checkedAt ||
          log.confirmedAt ||
          log.hqCheckedAt ||
          "";

        const title =
          log.title ||
          log.category ||
          log.type ||
          "매장 운영기록";

        const content =
          log.content ||
          log.memo ||
          "-";

        const request =
          log.request ||
          log.requestText ||
          "";

        return `
          <article
            class="recent-item ${
              urgency === "긴급"
                ? "urgent"
                : ""
            }">

            <div class="recent-item-header">

              <div>

                <div class="recent-item-title">
                  ${escapeHtml(title)}
                </div>

                <div class="recent-item-meta">

                  ${escapeHtml(
                    log.date ||
                    log.reportDate ||
                    ""
                  )}

                  ${
                    log.store
                      ? " · " +
                        escapeHtml(log.store)
                      : ""
                  }

                  ${
                    log.type
                      ? " · " +
                        escapeHtml(log.type)
                      : ""
                  }

                  ${
                    log.writer
                      ? " · 작성자 " +
                        escapeHtml(log.writer)
                      : ""
                  }

                </div>

              </div>

              <span
                class="recent-status-badge ${statusClass}">

                ${escapeHtml(
                  getStoreStatusLabel(
                    normalizedStatus
                  )
                )}

              </span>

            </div>


            <div class="recent-content">

              <strong>구분</strong>
              ${escapeHtml(
                log.category ||
                "-"
              )}

              <br>

              <strong>내용</strong>
              ${escapeHtml(content)}

              ${
                request
                  ? `
                    <br>
                    <strong>요청·전달사항</strong>
                    ${escapeHtml(request)}
                  `
                  : ""
              }

            </div>


            <div style="margin-top:12px;">

              <span class="badge ${badgeClass}">
                ${escapeHtml(urgency)}
              </span>

            </div>


            ${
              feedback
                ? `
                  <div class="head-office-feedback">

                    <div class="head-office-feedback-title">
                      본사 처리내용
                    </div>

                    <div class="head-office-feedback-content">
                      ${escapeHtml(feedback)}
                    </div>

                    ${
                      checkedAt
                        ? `
                          <div class="head-office-checked-at">
                            본사 확인일시:
                            ${escapeHtml(checkedAt)}
                          </div>
                        `
                        : ""
                    }

                  </div>
                `
                : normalizedStatus !== "미확인"
                  ? `
                    <div class="head-office-feedback">

                      <div class="head-office-feedback-title">
                        본사 처리상태
                      </div>

                      <div class="head-office-feedback-content">
                        ${escapeHtml(
                          getStoreStatusLabel(
                            normalizedStatus
                          )
                        )}
                      </div>

                      ${
                        checkedAt
                          ? `
                            <div class="head-office-checked-at">
                              본사 확인일시:
                              ${escapeHtml(checkedAt)}
                            </div>
                          `
                          : ""
                      }

                    </div>
                  `
                  : ""
            }

          </article>
        `;
      }).join("");

  } catch (e) {

    console.error(e);

    box.innerHTML = `
      <div class="recent-loading">
        최근내역을 불러오지 못했습니다.<br>
        ${escapeHtml(e.message)}
      </div>
    `;
  }
}
function normalizeStoreStatus(
  status,
  hqCheck
) {
  const statusText =
    String(status || "").trim();

  const checkText =
    String(hqCheck || "").trim();

  if (
    statusText === "조치완료"
  ) {
    return "조치완료";
  }

  if (
    statusText === "확인완료"
  ) {
    return "확인완료";
  }

  if (
    statusText === "조치필요"
  ) {
    return "조치필요";
  }

  if (
    statusText === "보완요청" ||
    statusText === "보완사항"
  ) {
    return "보완요청";
  }

  if (
    statusText === "확인사항"
  ) {
    return "확인사항";
  }

  if (
    statusText === "본사미확인" ||
    statusText === "미확인" ||
    statusText === ""
  ) {
    return "미확인";
  }

  if (
    checkText === "Y" ||
    checkText === "확인완료"
  ) {
    return "확인완료";
  }

  return statusText;
}


function getStoreStatusLabel(status) {
  const statusText =
    String(status || "").trim();

  if (statusText === "미확인") {
    return "본사 미확인";
  }

  if (statusText === "확인사항") {
    return "본사 확인사항";
  }

  if (statusText === "보완요청") {
    return "본사 보완요청";
  }

  if (statusText === "조치필요") {
    return "조치필요";
  }

  if (statusText === "확인완료") {
    return "확인완료";
  }

  if (statusText === "조치완료") {
    return "조치완료";
  }

  return statusText || "본사 미확인";
}


function getStoreStatusClass(status) {
  const statusText =
    String(status || "").trim();

  if (statusText === "확인사항") {
    return "status-check";
  }

  if (statusText === "보완요청") {
    return "status-supplement";
  }

  if (statusText === "조치필요") {
    return "status-action";
  }

  if (
    statusText === "확인완료" ||
    statusText === "조치완료"
  ) {
    return "status-complete";
  }

  return "status-pending";
}


function extractHeadOfficeFeedback(value) {
  const text =
    String(value || "");

  const marker =
    "[본사피드백]";

  const markerIndex =
    text.lastIndexOf(marker);

  if (markerIndex < 0) {
    return "";
  }

  return text
    .substring(
      markerIndex +
      marker.length
    )
    .trim();
}


function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/* =========================================================
   한국의집 매장 운영관리 · 대시보드 디자인 업그레이드
   기존 기능 및 HTML 구조는 변경하지 않음
========================================================= */

:root {
  --kh-bg: #f3f5f8;
  --kh-surface: #ffffff;
  --kh-surface-soft: #faf8f5;

  --kh-brown-950: #35170c;
  --kh-brown-900: #4b2010;
  --kh-brown-800: #6a2811;
  --kh-brown-700: #8f3514;
  --kh-brown-600: #a9441b;

  --kh-gold: #c79a4a;
  --kh-gold-soft: #f7ead2;

  --kh-text: #202938;
  --kh-text-soft: #667085;
  --kh-border: #e3e8ef;

  --kh-red: #d92d20;
  --kh-orange: #e87422;
  --kh-green: #16865c;
  --kh-blue: #2563eb;

  --kh-shadow:
    0 10px 30px rgba(29, 41, 57, 0.07);

  --kh-shadow-strong:
    0 18px 45px rgba(56, 25, 13, 0.13);
}


/* =========================================================
   전체 화면
========================================================= */

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--kh-bg);
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(
      circle at top right,
      rgba(199, 154, 74, 0.09),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      #f8f9fb 0,
      var(--kh-bg) 360px
    );

  color: var(--kh-text);

  font-family:
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    Arial,
    sans-serif;
}


/* =========================================================
   상단 헤더
========================================================= */

.header {
  position: relative;
  overflow: hidden;

  width: calc(100% - 32px);
  max-width: 1880px;

  margin: 16px auto 0;
  padding: 30px 38px 31px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;

  background:
    linear-gradient(
      118deg,
      var(--kh-brown-950) 0%,
      var(--kh-brown-800) 55%,
      #9a3713 100%
    );

  box-shadow: var(--kh-shadow-strong);

  color: #ffffff;
}

.header::before {
  content: "";

  position: absolute;
  top: -90px;
  right: 5%;

  width: 300px;
  height: 300px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(255, 255, 255, 0.14),
      rgba(255, 255, 255, 0) 68%
    );
}

.header::after {
  content: "韓";

  position: absolute;
  top: 50%;
  right: 50px;

  transform: translateY(-50%);

  color: rgba(255, 255, 255, 0.08);

  font-family: serif;
  font-size: 105px;
  font-weight: 900;
  line-height: 1;
}

.header h1 {
  position: relative;
  z-index: 1;

  margin: 0;

  color: #ffffff;

  font-size: clamp(25px, 2vw, 34px);
  font-weight: 900;
  letter-spacing: -1.2px;
}

.header p {
  position: relative;
  z-index: 1;

  margin: 8px 0 0;

  color: rgba(255, 255, 255, 0.72);

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
}


/* =========================================================
   메인 컨테이너
========================================================= */

.container {
  width: min(96%, 1500px);
  max-width: 1500px;

  margin: 0 auto;
  padding: 24px 0 60px;
}


/* =========================================================
   상단 요약 카드
========================================================= */

.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  margin-bottom: 18px;
}

.summary-card {
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  min-height: 116px;
  padding: 22px 24px 21px 29px;

  border: 1px solid rgba(227, 232, 239, 0.9);
  border-radius: 20px;

  background:
    linear-gradient(
      145deg,
      #ffffff 0%,
      #fbfcfe 100%
    );

  box-shadow: var(--kh-shadow);
}

.summary-card::before {
  content: "";

  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 0;

  width: 5px;

  border-radius: 0 5px 5px 0;

  background: var(--kh-brown-700);
}

.summary-card:nth-child(2)::before {
  background: var(--kh-red);
}

.summary-card:nth-child(3)::before {
  background: var(--kh-orange);
}

.summary-card::after {
  position: absolute;
  top: 20px;
  right: 23px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 35px;
  height: 35px;

  border-radius: 11px;

  background: #f6f7f9;

  color: var(--kh-text-soft);

  font-size: 16px;
  font-weight: 900;
}

.summary-card:nth-child(1)::after {
  content: "+";
}

.summary-card:nth-child(2)::after {
  content: "!";
  color: var(--kh-red);
  background: #fff1f0;
}

.summary-card:nth-child(3)::after {
  content: "●";
  color: var(--kh-orange);
  background: #fff4e8;
  font-size: 11px;
}

.summary-card strong {
  display: block;

  color: var(--kh-brown-900);

  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
}

.summary-card:nth-child(2) strong {
  color: var(--kh-red);
}

.summary-card:nth-child(3) strong {
  color: var(--kh-orange);
}

.summary-card span {
  display: block;

  margin-top: 10px;

  color: var(--kh-text-soft);

  font-size: 13px;
  font-weight: 800;
}


/* =========================================================
   탭 메뉴
========================================================= */

.tabs {
  display: grid;
  grid-template-columns: repeat(7, minmax(100px, 1fr));
  gap: 8px;

  margin-bottom: 18px;
  padding: 8px;

  border: 1px solid var(--kh-border);
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.78);

  box-shadow:
    0 5px 16px rgba(29, 41, 57, 0.04);

  backdrop-filter: blur(12px);
}

.tab {
  min-height: 48px;
  padding: 9px 12px;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;

  color: #5e6878;

  font-size: 13px;
  font-weight: 850;

  cursor: pointer;

  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.tab:hover {
  color: var(--kh-brown-800);
  background: #f9f2ec;
}

.tab.active {
  border-color: rgba(255, 255, 255, 0.12);

  background:
    linear-gradient(
      135deg,
      var(--kh-brown-800),
      var(--kh-brown-600)
    );

  color: #ffffff;

  box-shadow:
    0 8px 18px rgba(143, 53, 20, 0.25);

  transform: translateY(-1px);
}


/* =========================================================
   입력 패널
========================================================= */

.panel {
  display: none;

  position: relative;

  padding: 28px 30px 31px;

  border: 1px solid var(--kh-border);
  border-radius: 22px;

  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #fdfdfd 100%
    );

  box-shadow: var(--kh-shadow);
}

.panel.active {
  display: block;
  animation: khPanelOpen 0.24s ease;
}

@keyframes khPanelOpen {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel > h2 {
  position: relative;

  margin: 0 0 25px;
  padding: 0 0 16px 18px;

  border-bottom: 1px solid #edf0f4;

  color: var(--kh-text);

  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.7px;
}

.panel > h2::before {
  content: "";

  position: absolute;
  top: 3px;
  left: 0;

  width: 6px;
  height: 24px;

  border-radius: 5px;

  background:
    linear-gradient(
      180deg,
      var(--kh-gold),
      var(--kh-brown-700)
    );
}


/* =========================================================
   폼 배치
========================================================= */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;

  margin-bottom: 19px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;

  color: #344054;

  font-size: 13px;
  font-weight: 850;
}

.full-label {
  display: flex;
  margin-top: 17px;
}


/* =========================================================
   입력 요소
========================================================= */

input,
select,
textarea {
  width: 100%;

  border: 1px solid #d9e0e8;
  border-radius: 12px;

  outline: none;

  background: #ffffff;

  color: var(--kh-text);

  font: inherit;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

input,
select {
  min-height: 48px;
  padding: 10px 14px;
}

textarea {
  min-height: 108px;
  padding: 14px 15px;

  line-height: 1.65;

  resize: vertical;
}

input:hover,
select:hover,
textarea:hover {
  border-color: #c7d0dc;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--kh-brown-600);

  background: #fffdfb;

  box-shadow:
    0 0 0 4px rgba(169, 68, 27, 0.1);
}

input::placeholder,
textarea::placeholder {
  color: #a1aab8;
}


/* =========================================================
   저장 버튼
========================================================= */

.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 190px;
  min-height: 50px;

  margin-top: 22px;
  padding: 12px 25px;

  border: 0;
  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      var(--kh-brown-800),
      var(--kh-brown-600)
    );

  color: #ffffff;

  font-size: 14px;
  font-weight: 900;

  box-shadow:
    0 9px 20px rgba(143, 53, 20, 0.24);

  cursor: pointer;

  transition:
    transform 0.17s ease,
    box-shadow 0.17s ease,
    filter 0.17s ease;
}

.primary::before {
  content: "✓";
  margin-right: 8px;
  font-size: 14px;
}

.primary:hover {
  transform: translateY(-2px);

  box-shadow:
    0 13px 25px rgba(143, 53, 20, 0.29);

  filter: brightness(1.04);
}

.primary:active {
  transform: translateY(0);
}


/* =========================================================
   최근내역
========================================================= */

.recent-list {
  display: grid;
  gap: 13px;
  margin-top: 18px;
}

.log-card,
.recent-item {
  position: relative;

  padding: 18px 19px;

  border: 1px solid var(--kh-border);
  border-radius: 15px;

  background: #ffffff;

  box-shadow:
    0 5px 15px rgba(29, 41, 57, 0.04);
}

.log-card:hover,
.recent-item:hover {
  border-color: #d6c2b7;

  box-shadow:
    0 9px 22px rgba(56, 25, 13, 0.08);
}

.log-title {
  padding-right: 80px;

  color: var(--kh-text);

  font-size: 15px;
  font-weight: 900;
}

.log-meta {
  margin-top: 10px;

  color: #596579;

  font-size: 13px;
  line-height: 1.75;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 26px;
  padding: 4px 9px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 900;
}

.log-card > .badge {
  position: absolute;
  top: 16px;
  right: 16px;
}

.badge.normal {
  background: #eef2f6;
  color: #526174;
}

.badge.important {
  background: #fff2d9;
  color: #9a5b00;
}

.badge.urgent {
  background: #fee4e2;
  color: #b42318;
}


/* =========================================================
   최근내역 본사 처리상태
========================================================= */

.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;

  margin-bottom: 20px;
  padding-bottom: 17px;

  border-bottom: 1px solid #edf0f4;
}

.history-header h2 {
  position: relative;

  margin: 0;
  padding-left: 18px;

  color: var(--kh-text);

  font-size: 23px;
  font-weight: 900;
}

.history-header h2::before {
  content: "";

  position: absolute;
  top: 2px;
  left: 0;

  width: 6px;
  height: 24px;

  border-radius: 5px;

  background:
    linear-gradient(
      180deg,
      var(--kh-gold),
      var(--kh-brown-700)
    );
}

.history-description {
  margin: 7px 0 0 18px;

  color: var(--kh-text-soft);

  font-size: 13px;
}

.history-refresh-btn {
  min-height: 42px;
  padding: 9px 15px;

  border: 1px solid #d6b8a8;
  border-radius: 11px;

  background: #fffaf6;

  color: var(--kh-brown-700);

  font-weight: 850;

  cursor: pointer;
}

.history-refresh-btn:hover {
  border-color: var(--kh-brown-700);
  background: #fff3eb;
}

.history-status-guide {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin: 17px 0;
  padding: 13px 14px;

  border: 1px solid var(--kh-border);
  border-radius: 13px;

  background: #f8fafc;
}

.history-guide-item,
.recent-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 29px;
  padding: 5px 10px;

  border-radius: 999px;

  font-size: 11px;
  font-weight: 900;
}

.status-pending {
  background: #eef2f6;
  color: #526174;
}

.status-check {
  background: #e5efff;
  color: #245bc7;
}

.status-supplement {
  background: #fff0dc;
  color: #b45309;
}

.status-action {
  background: #fee4e2;
  color: #b42318;
}

.status-complete {
  background: #dcfce7;
  color: #137a4d;
}

.recent-loading {
  padding: 34px 18px;

  border: 1px dashed #cfd7e3;
  border-radius: 14px;

  background: #fbfcfd;

  color: var(--kh-text-soft);

  text-align: center;
}

.recent-item.urgent {
  border-left: 5px solid var(--kh-red);
}

.recent-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.recent-item-title {
  color: var(--kh-text);

  font-size: 16px;
  font-weight: 900;
}

.recent-item-meta {
  margin-top: 6px;

  color: var(--kh-text-soft);

  font-size: 12px;
}

.recent-content {
  margin-top: 14px;

  color: #465368;

  font-size: 13px;
  line-height: 1.75;
  white-space: pre-line;
}

.recent-content strong {
  display: inline-block;
  min-width: 61px;

  color: #263348;
}

.head-office-feedback {
  margin-top: 15px;
  padding: 15px 16px;

  border: 1px solid #f0cdb3;
  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #fff9f3,
      #fff4ea
    );
}

.head-office-feedback-title {
  margin-bottom: 7px;

  color: var(--kh-brown-700);

  font-size: 12px;
  font-weight: 900;
}

.head-office-feedback-content {
  color: #713a22;

  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
}

.head-office-checked-at {
  margin-top: 8px;

  color: #9b6b55;

  font-size: 11px;
}


/* =========================================================
   넓은 데스크톱 화면
========================================================= */

@media (min-width: 1400px) {
  .container {
    width: min(94%, 1500px);
  }

  .panel {
    padding: 32px 36px 35px;
  }

  .form-grid {
    gap: 20px 25px;
  }

  textarea {
    min-height: 120px;
  }
}


/* =========================================================
   태블릿
========================================================= */

@media (max-width: 1050px) {
  .tabs {
    grid-template-columns:
      repeat(4, minmax(120px, 1fr));
  }
}


/* =========================================================
   모바일
========================================================= */

@media (max-width: 720px) {
  .header {
    width: calc(100% - 20px);

    margin-top: 10px;
    padding: 24px 21px;

    border-radius: 18px;
  }

  .header::after {
    right: 15px;
    font-size: 75px;
  }

  .container {
    width: calc(100% - 20px);
    padding-top: 16px;
  }

  .summary {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-card {
    min-height: 91px;
    padding: 17px 20px 17px 25px;
  }

  .summary-card strong {
    font-size: 29px;
  }

  .tabs {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 7px;
    padding: 7px;
  }

  .tab {
    min-height: 44px;
  }

  .panel {
    padding: 23px 18px 25px;
    border-radius: 17px;
  }

  .panel > h2,
  .history-header h2 {
    font-size: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  input,
  select {
    min-height: 47px;
  }

  textarea {
    min-height: 105px;
  }

  .primary {
    width: 100%;
    min-width: 0;
  }

  .history-header {
    flex-direction: column;
  }

  .history-refresh-btn {
    width: 100%;
  }

  .recent-item-header {
    flex-direction: column;
  }
}