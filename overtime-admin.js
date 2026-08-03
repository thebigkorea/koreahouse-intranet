const API_URL =
  "https://script.google.com/macros/s/AKfycbyIR9zeGZz14r-5RjUeHL0amYXNVu7QaG-oQ6kmusge__3VZ7C94GW-6PT-B_V_asRT/exec";

let ALL_LIST = [];

window.addEventListener("load", () => {
  setThisMonth();
  document.getElementById("statusFilter").value = "등록";
  loadList();
});

function setThisMonth(){

  const today =
    new Date();

  const y =
    today.getFullYear();

  const m =
    String(
      today.getMonth() + 1
    ).padStart(2,"0");

  document.getElementById(
    "searchMonth"
  ).value = `${y}-${m}`;

  document.getElementById(
    "statusFilter"
  ).value = "등록";
}

function getSelectedMonthRange(){

  const month =
    document.getElementById(
      "searchMonth"
    ).value;

  if(!month){
    return null;
  }

  const [year, monthNumber] =
    month.split("-").map(Number);

  const lastDay =
    new Date(
      year,
      monthNumber,
      0
    ).getDate();

  return {
    month,
    year,
    monthNumber,
    startDate:
      `${year}-${String(monthNumber).padStart(2,"0")}-01`,
    endDate:
      `${year}-${String(monthNumber).padStart(2,"0")}-` +
      String(lastDay).padStart(2,"0")
  };
}

async function loadList(){

  const range =
    getSelectedMonthRange();

  if(!range){
    alert("조회월을 선택하세요.");
    return;
  }

  const employeeName =
    document.getElementById(
      "employeeName"
    ).value.trim();

  const status =
    document.getElementById(
      "statusFilter"
    ).value;

  const url =
    `${API_URL}?action=list` +
    `&startDate=${encodeURIComponent(range.startDate)}` +
    `&endDate=${encodeURIComponent(range.endDate)}` +
    `&employeeName=${encodeURIComponent(employeeName)}` +
    `&t=${Date.now()}`;

  const tbody =
    document.getElementById("tbody");

  tbody.innerHTML =
    `<tr>
      <td colspan="9" class="empty">
        불러오는 중...
      </td>
    </tr>`;

  try{

    const res =
      await fetch(url);

    const data =
      await res.json();

    ALL_LIST =
      data.list || [];

    let list =
      [...ALL_LIST];

    if(status){
      list =
        list.filter(
          item => item.status === status
        );
    }

    renderSummary(list);
    renderTable(list);

    /*
     * 직원별 월간 요약은
     * 승인된 내역 기준으로 표시합니다.
     */
    renderEmployeeMonthlySummary(
      ALL_LIST,
      range
    );

  }catch(e){

    console.error(e);

    tbody.innerHTML =
      `<tr>
        <td colspan="9" class="empty">
          조회 실패
        </td>
      </tr>`;
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

  const range =
    getSelectedMonthRange();

  if(!range){
    alert("조회월을 선택하세요.");
    return;
  }

  const year =
    range.year;

  const month =
    range.monthNumber;

  const title =
    `한국의집 롯데월드몰점 ` +
    `${String(year).slice(2)}년 ` +
    `${String(month).padStart(2,"0")}월 ` +
    `초과근무 내역`;

  document.getElementById(
    "monthlyTitle"
  ).textContent = title;

  document.getElementById(
    "employeeMonthlyTitle"
  ).textContent =
    `${year}년 ${month}월 직원별 초과근무 요약`;

  try{

    /*
     * 일반 목록도 선택한 월 기준으로 다시 조회합니다.
     */
    await loadList();

    const res =
      await fetch(
        `${API_URL}?action=monthly` +
        `&year=${year}` +
        `&month=${month}` +
        `&t=${Date.now()}`
      );

    const data =
      await res.json();

    if(!data.success){

      alert(
        "월별 일지를 불러오지 못했습니다."
      );

      return;
    }

    renderMonthlyReport(
      data.data
    );

  }catch(e){

    console.error(e);

    alert(
      "월별 일지 조회 중 오류가 발생했습니다."
    );
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
/* =========================================
   직원별 월간 초과근무 요약
========================================= */

let CURRENT_DETAIL_EMPLOYEE = "";
let OVERTIME_KAKAO_CANVAS = null;


function getApprovedMonthlyList_(){

  return ALL_LIST.filter(item =>
    item.status === "승인"
  );
}


function calculateEmployeeOvertime_(list){

  const totals = {
    overtime:0,
    breakTime:0,
    offDay:0,
    unusedAnnual:0,
    earlyLeave:0,
    recognized:0,
    count:list.length
  };

  list.forEach(item => {

    const type =
      String(item.type || "").trim();

    const hours =
      Number(item.hours || 0);

    if(type === "미휴게"){

      totals.breakTime += hours;
      totals.recognized += hours;

    }else if(type === "휴무근무"){

      totals.offDay += hours;
      totals.recognized += hours;

    }else if(type === "연차미사용"){

      totals.unusedAnnual += hours;

    }else if(type === "조퇴"){

      totals.earlyLeave += hours;
      totals.recognized -= hours;

    }else{

      totals.overtime += hours;
      totals.recognized += hours;

    }

  });

  return totals;
}


function formatHours_(value){

  const number =
    Number(value || 0);

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(1);
}


function renderEmployeeMonthlySummary(
  sourceList,
  range
){

  const tbody =
    document.getElementById(
      "employeeMonthlyTbody"
    );

  if(!tbody) return;

  const approved =
    sourceList.filter(
      item => item.status === "승인"
    );

  const employeeMap =
    new Map();

  approved.forEach(item => {

    const name =
      String(
        item.employeeName || ""
      ).trim();

    if(!name) return;

    if(!employeeMap.has(name)){
      employeeMap.set(name, []);
    }

    employeeMap.get(name).push(item);

  });

  const names =
    Array.from(
      employeeMap.keys()
    ).sort((a,b) =>
      a.localeCompare(b,"ko")
    );

  if(!names.length){

    tbody.innerHTML =
      `<tr>
        <td colspan="9" class="empty">
          승인된 초과근무 내역이 없습니다.
        </td>
      </tr>`;

    return;
  }

  tbody.innerHTML =
    names.map(name => {

      const list =
        employeeMap.get(name);

      const totals =
        calculateEmployeeOvertime_(list);

      const encodedName =
        encodeURIComponent(name);

      return `
        <tr>
          <td class="employee-name">
            ${safe(name)}
          </td>

          <td>
            ${formatHours_(totals.overtime)}시간
          </td>

          <td>
            ${formatHours_(totals.breakTime)}시간
          </td>

          <td>
            ${formatHours_(totals.offDay)}시간
          </td>

          <td>
            ${formatHours_(totals.unusedAnnual)}시간
          </td>

          <td>
            ${formatHours_(totals.earlyLeave)}시간
          </td>

          <td class="total-hours">
            ${formatHours_(totals.recognized)}시간
          </td>

          <td>
            ${totals.count}건
          </td>

          <td>
            <button
              type="button"
              class="employee-detail-btn"
              onclick="openEmployeeDetail(
                decodeURIComponent('${encodedName}')
              )">
              상세보기
            </button>

            <button
              type="button"
              class="employee-kakao-btn"
              onclick="openEmployeeKakaoImage(
                decodeURIComponent('${encodedName}')
              )">
              카톡 이미지
            </button>
          </td>
        </tr>
      `;

    }).join("");
}


function getEmployeeApprovedList_(employeeName){

  return getApprovedMonthlyList_()
    .filter(item =>
      String(item.employeeName || "").trim() ===
      employeeName
    )
    .sort((a,b) =>
      String(a.workDate || "")
        .localeCompare(
          String(b.workDate || "")
        )
    );
}


function buildEmployeeDetailHtml_(
  employeeName,
  imageMode = false
){

  const range =
    getSelectedMonthRange();

  const list =
    getEmployeeApprovedList_(
      employeeName
    );

  const totals =
    calculateEmployeeOvertime_(
      list
    );

  const titleMonth =
    range
      ? `${range.year}년 ${range.monthNumber}월`
      : "";

  const rows =
    list.length
      ? list.map(item => `
          <tr>
            <td>${safe(item.workDate)}</td>
            <td>${safe(item.type)}</td>
            <td>
              ${formatHours_(item.hours)}시간
            </td>
            <td class="left">
              ${safe(item.reason)}
            </td>
            <td class="left">
              ${safe(item.memo)}
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td colspan="5">
              승인된 내역이 없습니다.
            </td>
          </tr>
        `;

  return `
    ${
      imageMode
        ? `
          <div class="overtime-kakao-card-header">
            <h1>
              한국의집 롯데월드몰점
            </h1>

            <h2>
              ${titleMonth} 초과근무 내역
            </h2>
          </div>
        `
        : ""
    }

    <div
      style="
        margin-bottom:16px;
        font-size:21px;
        font-weight:900;
      ">
      직원명: ${safe(employeeName)}
    </div>

    <div class="employee-detail-summary">

      <div>
        <span>초과근무</span>
        <strong>
          ${formatHours_(totals.overtime)}
        </strong>
      </div>

      <div>
        <span>미휴게</span>
        <strong>
          ${formatHours_(totals.breakTime)}
        </strong>
      </div>

      <div>
        <span>휴무근무</span>
        <strong>
          ${formatHours_(totals.offDay)}
        </strong>
      </div>

      <div>
        <span>연차미사용</span>
        <strong>
          ${formatHours_(totals.unusedAnnual)}
        </strong>
      </div>

      <div>
        <span>조퇴</span>
        <strong>
          ${formatHours_(totals.earlyLeave)}
        </strong>
      </div>

      <div>
        <span>인정합계</span>
        <strong>
          ${formatHours_(totals.recognized)}
        </strong>
      </div>

    </div>

    <table class="employee-detail-table">

      <thead>
        <tr>
          <th>근무일자</th>
          <th>구분</th>
          <th>시간</th>
          <th>사유</th>
          <th>비고</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>

    </table>

    ${
      imageMode
        ? `
          <div class="overtime-kakao-note">
            ※ 승인된 초과근무 등록내역 기준입니다.
          </div>
        `
        : ""
    }
  `;
}


function openEmployeeDetail(employeeName){

  CURRENT_DETAIL_EMPLOYEE =
    employeeName;

  const range =
    getSelectedMonthRange();

  document.getElementById(
    "employeeDetailTitle"
  ).textContent =
    `${employeeName} · ` +
    `${range.year}년 ${range.monthNumber}월 초과근무 내역`;

  document.getElementById(
    "employeeDetailContent"
  ).innerHTML =
    buildEmployeeDetailHtml_(
      employeeName,
      false
    );

  document.getElementById(
    "employeeDetailModalBg"
  ).classList.add("show");

  document.body.style.overflow =
    "hidden";
}


function closeEmployeeDetailModal(){

  document.getElementById(
    "employeeDetailModalBg"
  ).classList.remove("show");

  document.body.style.overflow =
    "";
}


function closeEmployeeDetailByBg(event){

  if(
    event.target &&
    event.target.id ===
      "employeeDetailModalBg"
  ){
    closeEmployeeDetailModal();
  }
}


function makeCurrentEmployeeKakaoImage(){

  if(!CURRENT_DETAIL_EMPLOYEE){
    return;
  }

  openEmployeeKakaoImage(
    CURRENT_DETAIL_EMPLOYEE
  );
}


async function openEmployeeKakaoImage(
  employeeName
){

  if(typeof html2canvas !== "function"){

    alert(
      "이미지 생성 프로그램을 불러오지 못했습니다."
    );

    return;
  }

  const list =
    getEmployeeApprovedList_(
      employeeName
    );

  if(!list.length){

    alert(
      "해당 직원의 승인된 내역이 없습니다."
    );

    return;
  }

  let captureArea = null;

  try{

    captureArea =
      document.createElement("div");

    captureArea.className =
      "overtime-kakao-card";

    captureArea.style.position =
      "absolute";

    captureArea.style.left =
      "0";

    captureArea.style.top =
      "0";

    captureArea.style.zIndex =
      "-1";

    captureArea.style.pointerEvents =
      "none";

    captureArea.innerHTML =
      buildEmployeeDetailHtml_(
        employeeName,
        true
      );

    document.body.appendChild(
      captureArea
    );

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    OVERTIME_KAKAO_CANVAS =
      await html2canvas(
        captureArea,
        {
          backgroundColor:"#ffffff",
          scale:2,
          logging:false,
          useCORS:true
        }
      );

    document.getElementById(
      "overtimeKakaoPreviewImage"
    ).src =
      OVERTIME_KAKAO_CANVAS
        .toDataURL("image/png");

    document.getElementById(
      "overtimeKakaoModalBg"
    ).classList.add("show");

    document.body.style.overflow =
      "hidden";

    CURRENT_DETAIL_EMPLOYEE =
      employeeName;

  }catch(error){

    console.error(error);

    alert(
      "카톡 이미지 생성 중 오류가 발생했습니다."
    );

  }finally{

    if(captureArea){
      captureArea.remove();
    }
  }
}


async function copyOvertimeKakaoImage(){

  if(!OVERTIME_KAKAO_CANVAS){

    alert(
      "먼저 카톡 이미지를 만들어주세요."
    );

    return;
  }

  try{

    const blob =
      await new Promise(
        (resolve,reject) => {

          OVERTIME_KAKAO_CANVAS.toBlob(
            result => {

              if(result){
                resolve(result);
              }else{
                reject(
                  new Error(
                    "이미지 변환 실패"
                  )
                );
              }

            },
            "image/png"
          );

        }
      );

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png":blob
      })
    ]);

    alert(
      "이미지가 복사되었습니다.\n" +
      "카카오톡에서 Ctrl + V를 누르세요."
    );

  }catch(error){

    console.error(error);

    alert(
      "이미지 복사에 실패했습니다.\n" +
      "PNG 저장 버튼을 이용해주세요."
    );
  }
}


function downloadOvertimeKakaoImage(){

  if(!OVERTIME_KAKAO_CANVAS){
    return;
  }

  const range =
    getSelectedMonthRange();

  const link =
    document.createElement("a");

  link.download =
    `한국의집_${CURRENT_DETAIL_EMPLOYEE}_` +
    `${range.month}_초과근무.png`;

  link.href =
    OVERTIME_KAKAO_CANVAS
      .toDataURL("image/png");

  document.body.appendChild(link);

  link.click();

  link.remove();
}


function closeOvertimeKakaoModal(){

  document.getElementById(
    "overtimeKakaoModalBg"
  ).classList.remove("show");

  document.body.style.overflow =
    "";
}


function closeOvertimeKakaoByBg(event){

  if(
    event.target &&
    event.target.id ===
      "overtimeKakaoModalBg"
  ){
    closeOvertimeKakaoModal();
  }
}


document.addEventListener(
  "keydown",
  function(event){

    if(event.key === "Escape"){
      closeEmployeeDetailModal();
      closeOvertimeKakaoModal();
    }

  }
);