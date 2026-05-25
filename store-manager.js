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
  // 1. 한국의집 기존 원장 저장
  const data = await api({
    action: "saveStoreDailyLog",
    ...payload
  });

  // 2. 본사 매장점검_통합원장에도 저장
  try {
    await fetch(HQ_API_URL, {
      method: "POST",
      body: JSON.stringify({
        storeName: payload.store || "",
        brand: "한국의집",
        writer: payload.writer || "",
        category: payload.type || payload.category || "",
        priority: payload.urgency || "일반",
        content:
          "[구분] " + (payload.category || "") + "\n" +
          "[제목] " + (payload.title || "") + "\n" +
          "[내용] " + (payload.content || "") + "\n" +
          "[요청/전달] " + (payload.request || "") + "\n" +
          "[추가사항] " + (payload.extra || ""),
        photo: ""
      })
    });
  } catch (e) {
    console.log("본사 통합원장 저장 실패", e);
  }

  alert(data.message || "저장되었습니다.");

  loadDashboard();
  loadRecentLogs();
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
  try {

    const data = await api({
      action: "getStoreManagerLogs",
      store: val("historyStore"),
      type: val("historyType")
    });

    const logs = data.logs || [];
    const box = document.getElementById("recentList");

    if (logs.length === 0) {
      box.innerHTML =
        "<div class='log-card'>등록된 내역이 없습니다.</div>";
      return;
    }

    box.innerHTML = logs.map(log => {

      const badgeClass =
        log.urgency === "긴급"
          ? "urgent"
          : log.urgency === "중요"
          ? "important"
          : "normal";

      return `
        <div class="log-card">

          <div class="log-title">
            ${log.date || ""} /
            ${log.store || ""} /
            ${log.type || ""}
          </div>

          <div class="log-meta">
            구분 : ${log.category || "-"} <br>
            제목 : ${log.title || "-"} <br>
            작성/대상 : ${log.writer || "-"} <br>
            내용 : ${log.content || "-"} <br>
            상태 : ${log.status || "-"}
          </div>

          <span class="badge ${badgeClass}">
            ${log.urgency || "일반"}
          </span>

        </div>
      `;
    }).join("");

  } catch (e) {
    console.log(e);
  }
}