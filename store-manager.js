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
