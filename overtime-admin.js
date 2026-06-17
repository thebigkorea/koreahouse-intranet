const API_URL =
  "https://script.google.com/macros/s/AKfycbyIR9zeGZz14r-5RjUeHL0amYXNVu7QaG-oQ6kmusge__3VZ7C94GW-6PT-B_V_asRT/exec";

let ALL_LIST = [];

window.addEventListener("load", () => {
  setThisMonth();
  loadList();
});

function setThisMonth(){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2,"0");
  const last = new Date(y, today.getMonth() + 1, 0).getDate();

  document.getElementById("startDate").value = `${y}-${m}-01`;
  document.getElementById("endDate").value = `${y}-${m}-${String(last).padStart(2,"0")}`;
}

async function loadList(){
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const employeeName = document.getElementById("employeeName").value.trim();
  const status = document.getElementById("statusFilter").value;

  const url =
    `${API_URL}?action=list` +
    `&startDate=${encodeURIComponent(startDate)}` +
    `&endDate=${encodeURIComponent(endDate)}` +
    `&employeeName=${encodeURIComponent(employeeName)}` +
    `&t=${Date.now()}`;

  const tbody = document.getElementById("tbody");
  tbody.innerHTML = `<tr><td colspan="9" class="empty">불러오는 중...</td></tr>`;

  try{
    const res = await fetch(url);
    const data = await res.json();

    ALL_LIST = data.list || [];

    let list = [...ALL_LIST];

    if(status){
      list = list.filter(item => item.status === status);
    }

    renderSummary(list);
    renderTable(list);

  }catch(e){
    tbody.innerHTML = `<tr><td colspan="9" class="empty">조회 실패</td></tr>`;
  }
}

function renderSummary(list){
  document.getElementById("totalCount").textContent = list.length;
  document.getElementById("pendingCount").textContent =
    list.filter(x => x.status === "등록").length;
  document.getElementById("approvedCount").textContent =
    list.filter(x => x.status === "승인").length;
  document.getElementById("rejectedCount").textContent =
    list.filter(x => x.status === "반려").length;
}

function renderTable(list){
  const tbody = document.getElementById("tbody");

  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="9" class="empty">조회된 내역이 없습니다.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>${safe(item.workDate)}</td>
      <td><strong>${safe(item.employeeName)}</strong></td>
      <td>${safe(item.type)}</td>
      <td>${safe(item.hours)}시간</td>
      <td class="memo">${safe(item.reason)}</td>
      <td class="memo">${safe(item.memo)}</td>
      <td>${safe(item.writer)}</td>
      <td>
        <span class="badge ${badgeClass(item.status)}">
          ${safe(item.status)}
        </span>
      </td>
      <td>
        <button class="btn approve" onclick="changeStatus('${item.recordId}','승인')">승인</button>
        <button class="btn reject" onclick="changeStatus('${item.recordId}','반려')">반려</button>
        <button class="btn delete" onclick="deleteItem('${item.recordId}')">삭제</button>
      </td>
    </tr>
  `).join("");
}

async function changeStatus(recordId,status){
  const item = ALL_LIST.find(x => x.recordId === recordId);
  if(!item) return;

  const ok = confirm(`${item.employeeName}님의 초과근무 내역을 '${status}' 처리할까요?`);
  if(!ok) return;

  const payload = {
    action:"save",
    recordId:item.recordId,
    workDate:item.workDate,
    employeeName:item.employeeName,
    type:item.type,
    hours:item.hours,
    reason:item.reason,
    memo:item.memo,
    writer:item.writer,
    store:item.store,
    status
  };

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      body:JSON.stringify(payload)
    });

    const data = await res.json();

    if(data.success){
      alert(`${status} 처리되었습니다.`);
      loadList();
    }else{
      alert(data.message || "처리 실패");
    }

  }catch(e){
    alert("처리 중 오류가 발생했습니다.");
  }
}

async function deleteItem(recordId){
  const item = ALL_LIST.find(x => x.recordId === recordId);
  if(!item) return;

  const ok = confirm(`${item.employeeName}님의 초과근무 내역을 삭제할까요?`);
  if(!ok) return;

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      body:JSON.stringify({
        action:"delete",
        recordId
      })
    });

    const data = await res.json();

    if(data.success){
      alert("삭제되었습니다.");
      loadList();
    }else{
      alert(data.message || "삭제 실패");
    }

  }catch(e){
    alert("삭제 중 오류가 발생했습니다.");
  }
}

function badgeClass(status){
  if(status === "승인") return "approved";
  if(status === "반려") return "rejected";
  if(status === "수정") return "edit";
  return "pending";
}

function safe(value){
  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}