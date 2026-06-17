const API_URL =
  "https://script.google.com/macros/s/AKfycbyIR9zeGZz14r-5RjUeHL0amYXNVu7QaG-oQ6kmusge__3VZ7C94GW-6PT-B_V_asRT/exec";

let ALL_LIST = [];

window.addEventListener("load", () => {
  setThisMonth();
  document.getElementById("statusFilter").value = "등록";
  loadList();
});

function setThisMonth(){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2,"0");
  const last = new Date(y, today.getMonth() + 1, 0).getDate();

  document.getElementById("startDate").value = `${y}-${m}-01`;
  document.getElementById("endDate").value = `${y}-${m}-${String(last).padStart(2,"0")}`;
  document.getElementById("statusFilter").value = "등록";
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

  if(status === "승인"){
    document.getElementById("statusFilter").value = "등록";
  }

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

async function loadMonthlyReport(){

  const startDate =
    document.getElementById("startDate").value;

  if(!startDate){
    alert("조회 시작일을 선택하세요.");
    return;
  }

  const year =
    Number(startDate.substring(0,4));

  const month =
    Number(startDate.substring(5,7));

  const title =
    `한국의집 롯데월드몰점 ${String(year).slice(2)}년 ${String(month).padStart(2,"0")}월 초과근무 내역`;

  document.getElementById("monthlyTitle").textContent =
    title;

  try{

    const res =
      await fetch(
        `${API_URL}?action=monthly&year=${year}&month=${month}&t=${Date.now()}`
      );

    const data =
      await res.json();

    if(!data.success){
      alert("월별 일지를 불러오지 못했습니다.");
      return;
    }

    renderMonthlyReport(data.data);

  }catch(e){
    alert("월별 일지 조회 중 오류가 발생했습니다.");
  }
}

function renderMonthlyReport(data){

  const thead = document.getElementById("monthlyThead");
  const tbody = document.getElementById("monthlyTbody");
  const tfoot = document.getElementById("monthlyTfoot");

  const days = data.days || [];

  thead.innerHTML =
    `<tr>
      <th>직원명</th>
      ${days.map(d => `<th>${d}일</th>`).join("")}
      <th>시간합계</th>
      <th>미휴일수</th>
      <th>연차미사용</th>
    </tr>`;

  if(!data.rows || !data.rows.length){
    tbody.innerHTML =
      `<tr>
        <td colspan="${days.length + 4}">
          등록된 초과근무 내역이 없습니다.
        </td>
      </tr>`;

    tfoot.innerHTML = "";
    return;
  }

  let grandHourTotal = 0;
  let grandOffDayTotal = 0;
  let grandUnusedAnnualTotal = 0;

  tbody.innerHTML =
    data.rows.map(row => {

      let hourTotal = 0;
      let offDayTotal = 0;
      let unusedAnnualTotal = 0;

      const dayCells =
        days.map(day => {

          const entries =
            row.days && row.days[day]
            ? row.days[day]
            : [];

          if(!entries.length){
            return `<td></td>`;
          }

          const text =
            entries.map(e => {

              const type = e.type || "";
              const hours = Number(e.hours || 0);

              if(type === "휴무근무"){
                offDayTotal += hours;
                return `<span class="red-text">미휴 ${hours}</span>`;
              }

              if(type === "연차미사용"){
                unusedAnnualTotal += hours;
                return `<span class="red-text">연차 ${hours}</span>`;
              }

              if(type === "조퇴"){
                hourTotal -= hours;
                return `<span class="red-text">-${hours}</span>`;
              }

              hourTotal += hours;

              if(type === "미휴게"){
                return `<span class="red-text">${hours}</span>`;
              }

              return `${hours}`;

            }).join("<br>");

          return `<td>${text}</td>`;

        }).join("");

      grandHourTotal += hourTotal;
      grandOffDayTotal += offDayTotal;
      grandUnusedAnnualTotal += unusedAnnualTotal;

      return `
        <tr>
          <td class="name-cell">${safe(row.employeeName)}</td>
          ${dayCells}
          <td class="total-cell">${hourTotal}</td>
          <td class="total-cell">${offDayTotal}</td>
          <td class="total-cell">${unusedAnnualTotal}</td>
        </tr>
      `;

    }).join("");

  tfoot.innerHTML =
    `<tr>
      <td class="total-cell">전체합계</td>
      <td colspan="${days.length}"></td>
      <td class="total-cell">${grandHourTotal}</td>
      <td class="total-cell">${grandOffDayTotal}</td>
      <td class="total-cell">${grandUnusedAnnualTotal}</td>
    </tr>`;
}

function exportMonthlyExcel(){

  const table =
    document.getElementById("monthlyTable");

  if(!table || !table.innerText.trim()){
    alert("먼저 월별일지를 생성하세요.");
    return;
  }

  const title =
    document.getElementById("monthlyTitle").textContent || "초과근무일지";

  const html =
    `
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body>
      <h3>${title}</h3>
      ${table.outerHTML}
    </body>
    </html>
    `;

  const blob =
    new Blob(
      [html],
      {
        type:"application/vnd.ms-excel;charset=utf-8;"
      }
    );

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    title + ".xls";

  link.click();
}
async function approveAllPending(){

  const pendingList =
    ALL_LIST.filter(item => item.status === "등록");

  if(!pendingList.length){
    alert("승인할 내역이 없습니다.");
    return;
  }

  const ok =
    confirm(`${pendingList.length}건을 모두 승인 처리할까요?`);

  if(!ok) return;

  for(const item of pendingList){

    await fetch(API_URL,{
      method:"POST",
      body:JSON.stringify({
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
        status:"승인"
      })
    });

  }

  alert("전체 승인 완료");

document.getElementById("statusFilter").value = "등록";
loadList();
}