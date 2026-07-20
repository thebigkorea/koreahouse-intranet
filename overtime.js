const API_URL =
  "https://script.google.com/macros/s/AKfycbyIR9zeGZz14r-5RjUeHL0amYXNVu7QaG-oQ6kmusge__3VZ7C94GW-6PT-B_V_asRT/exec";

window.addEventListener("load", () => {

  setToday();
  setCurrentOvertimeMonth();

  loadEmployees();
  loadEmployeeManagementList();
  loadList();

  const typeSelect =
    document.getElementById("type");

  if(typeSelect){
    typeSelect.addEventListener(
      "change",
      changeUnitLabel
    );

    changeUnitLabel();
  }

  loadMonthlyOvertime();

});


function setToday(){
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  document.getElementById("workDate").value =
    `${yyyy}-${mm}-${dd}`;
}

async function saveOvertime(){

  const workDate =
    document.getElementById("workDate").value;

  const employeeName =
    document.getElementById("employeeName").value.trim();

  const type =
    document.getElementById("type").value;

  const hours =
    document.getElementById("hours").value;

  const reason =
    document.getElementById("reason").value.trim();

  const memo =
    document.getElementById("memo").value.trim();

  if(!workDate){
    alert("근무일자를 입력하세요.");
    return;
  }

  if(!employeeName){
    alert("직원명을 입력하세요.");
    return;
  }

  const payload = {
    action:"save",
    workDate,
    employeeName,
    type,
    hours,
    reason,
    memo,
    writer:"한국의집",
    store:"한국의집 롯데월드몰점"
  };

  try{
    const res = await fetch(API_URL,{
      method:"POST",
      body:JSON.stringify(payload)
    });

    const data = await res.json();

    if(data.success){
      alert("저장되었습니다.");
      clearForm();
      loadList();
    }else{
      alert(data.message || "저장 실패");
    }

  }catch(e){
    alert("저장 중 오류가 발생했습니다.");
  }
}

function clearForm(){
  document.getElementById("employeeName").value = "";
  document.getElementById("type").value = "초과근무";
  document.getElementById("hours").value = "0.5";
  document.getElementById("reason").value = "";
  document.getElementById("memo").value = "";
  setToday();
  changeUnitLabel();
}

async function loadList(){

  const tbody =
    document.getElementById("tbody");

  tbody.innerHTML =
    `<tr><td colspan="5" class="empty">불러오는 중...</td></tr>`;

  try{
    const res =
      await fetch(API_URL + "?action=list&t=" + Date.now());

    const data =
      await res.json();

    const list =
      data.list || [];

    if(!list.length){
      tbody.innerHTML =
        `<tr><td colspan="5" class="empty">등록된 내역이 없습니다.</td></tr>`;
      return;
    }

    tbody.innerHTML =
      list.slice(0,20).map(item => `
        <tr>
          <td>${safe(item.workDate)}</td>
          <td>${safe(item.employeeName)}</td>
          <td>${safe(item.type)}</td>
          <td>${safe(item.hours)}${
            item.type === "휴무근무"
            ? "일"
             : "시간"
            }
          </td>
          <td>${safe(item.reason)}</td>
        </tr>
      `).join("");

  }catch(e){
    tbody.innerHTML =
      `<tr><td colspan="5" class="empty">조회 실패</td></tr>`;
  }
}

function safe(value){
  return String(value || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}
async function loadEmployees(){

  const select =
    document.getElementById("employeeName");

  select.innerHTML =
    `<option value="">직원을 선택하세요</option>`;

  try{

    const res =
      await fetch(API_URL + "?action=employees&t=" + Date.now());

    const data =
      await res.json();

    const list =
      data.list || [];

    select.innerHTML =
      `<option value="">직원을 선택하세요</option>` +
      list.map(emp => `
        <option value="${safe(emp.name)}">
          ${safe(emp.name)}${emp.position ? " / " + safe(emp.position) : ""}
        </option>
      `).join("");

  }catch(e){

    select.innerHTML =
      `<option value="">직원목록 조회 실패</option>`;

  }
}
function toggleEmployeeBox(){
  const box = document.getElementById("employeeBox");
  box.style.display =
    box.style.display === "none" ? "block" : "none";
}

async function saveEmployee(){

  const name =
    document.getElementById("newEmployeeName").value.trim();

  const position =
    document.getElementById("newEmployeePosition").value.trim();

  const status =
    document.getElementById("newEmployeeStatus").value;

  if(!name){
    alert("직원명을 입력하세요.");
    return;
  }

  const payload = {
    action:"saveEmployee",
    name,
    position,
    status
  };

  try{

    const res = await fetch(API_URL,{
      method:"POST",
      body:JSON.stringify(payload)
    });

    const data = await res.json();

    if(data.success){
      alert("직원정보가 저장되었습니다.");

      document.getElementById("newEmployeeName").value = "";
      document.getElementById("newEmployeePosition").value = "";
      document.getElementById("newEmployeeStatus").value = "재직";

      loadEmployees();
      loadEmployeeManagementList();
    }else{
      alert(data.message || "직원 저장 실패");
    }

  }catch(e){
    alert("직원 저장 중 오류가 발생했습니다.");
  }
}
function changeUnitLabel(){

  const type =
    document.getElementById("type").value;

  const label =
    document.getElementById("hoursLabel");

  const hours =
    document.getElementById("hours");

  if(!label || !hours){
    return;
  }

  if(type === "휴무근무"){

    label.textContent = "일수";

    hours.innerHTML = `
      <option value="0.5">0.5일</option>
      <option value="1">1일</option>
    `;

    return;
  }

  if(type === "조퇴"){

    label.textContent = "차감시간";

    hours.innerHTML = `
      <option value="0.5">0.5시간 차감</option>
      <option value="1">1시간 차감</option>
      <option value="1.5">1.5시간 차감</option>
      <option value="2">2시간 차감</option>
      <option value="2.5">2.5시간 차감</option>
      <option value="3">3시간 차감</option>
      <option value="3.5">3.5시간 차감</option>
      <option value="4">4시간 차감</option>
      <option value="4.5">4.5시간 차감</option>
      <option value="5">5시간 차감</option>
      <option value="5.5">5.5시간 차감</option>
      <option value="6">6시간 차감</option>
      <option value="6.5">6.5시간 차감</option>
      <option value="7">7시간 차감</option>
      <option value="7.5">7.5시간 차감</option>
      <option value="8">8시간 차감</option>
    `;

    return;
  }

  label.textContent = "시간";

  hours.innerHTML = `
    <option value="0.5">0.5</option>
    <option value="1">1</option>
    <option value="1.5">1.5</option>
    <option value="2">2</option>
    <option value="2.5">2.5</option>
    <option value="3">3</option>
    <option value="3.5">3.5</option>
    <option value="4">4</option>
    <option value="4.5">4.5</option>
    <option value="5">5</option>
  `;

}

function showOvertimeTab(tabName){

  const sections = {
    monthly:
      document.getElementById(
        "monthlyEntrySection"
      ),

    employee:
      document.getElementById(
        "employeeManagementSection"
      ),

    work:
      document.getElementById(
        "workEntrySection"
      )
  };

  const buttons = {
    monthly:
      document.getElementById(
        "monthlyTabButton"
      ),

    employee:
      document.getElementById(
        "employeeTabButton"
      ),

    work:
      document.getElementById(
        "workTabButton"
      )
  };

  Object.keys(sections).forEach(
    function(key){

      if(sections[key]){
        sections[key].classList.toggle(
          "hidden",
          key !== tabName
        );
      }

      if(buttons[key]){
        buttons[key].classList.toggle(
          "active",
          key === tabName
        );
      }

    }
  );

  if(tabName === "monthly"){
    loadMonthlyOvertime();
    return;
  }

  if(tabName === "employee"){
    loadEmployeeManagementList();
    return;
  }

  loadEmployees();
  loadList();

}


async function loadEmployeeManagementList(){

  const tbody =
    document.getElementById(
      "employeeManagementBody"
    );

  if(!tbody){
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="empty">
        직원목록을 불러오는 중입니다.
      </td>
    </tr>
  `;

  try{

    const res =
      await fetch(
        API_URL +
        "?action=employees&t=" +
        Date.now()
      );

    const data = await res.json();
    const list = data.list || [];

    if(!list.length){

      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty">
            등록된 재직 직원이 없습니다.
          </td>
        </tr>
      `;

      return;
    }

    tbody.innerHTML =
      list.map(emp => `

        <tr>

          <td>
            <strong>
              ${safe(emp.name)}
            </strong>
          </td>

          <td>
            ${safe(emp.position || "-")}
          </td>

          <td>
            <span class="employee-status">
              ${safe(emp.status || "재직")}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="employee-edit-btn"
              onclick="editEmployee(
                '${encodeURIComponent(emp.name || "")}',
                '${encodeURIComponent(emp.position || "")}',
                '${encodeURIComponent(emp.status || "재직")}'
              )">
              수정
            </button>
          </td>

          <td>
  <button
    type="button"
    class="employee-delete-btn"
    onclick="deleteEmployee(
      '${encodeURIComponent(emp.name || "")}'
    )">
    삭제
  </button>
</td>

        </tr>

      `).join("");

  }catch(e){

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">
          직원목록 조회에 실패했습니다.
        </td>
      </tr>
    `;

  }
}


function editEmployee(
  encodedName,
  encodedPosition,
  encodedStatus
){

  document.getElementById(
    "newEmployeeName"
  ).value =
    decodeURIComponent(encodedName);

  document.getElementById(
    "newEmployeePosition"
  ).value =
    decodeURIComponent(encodedPosition);

  document.getElementById(
    "newEmployeeStatus"
  ).value =
    decodeURIComponent(encodedStatus);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function resetEmployeeForm(){

  document.getElementById(
    "newEmployeeName"
  ).value = "";

  document.getElementById(
    "newEmployeePosition"
  ).value = "";

  document.getElementById(
    "newEmployeeStatus"
  ).value = "재직";

  document.getElementById(
    "newEmployeeName"
  ).focus();
}
async function deleteEmployee(encodedName){

  const name =
    decodeURIComponent(encodedName);

  if(!confirm(
    `"${name}" 직원을 삭제하시겠습니까?`
  )){
    return;
  }

  try{

    const res =
      await fetch(API_URL,{
        method:"POST",
        body:JSON.stringify({
          action:"deleteEmployee",
          name
        })
      });

    const data =
      await res.json();

    if(data.success){

      alert("삭제되었습니다.");

      loadEmployees();
      loadEmployeeManagementList();

    }else{

      alert(
        data.message || "삭제 실패"
      );

    }

  }catch(e){

    alert("삭제 중 오류가 발생했습니다.");

  }

}
let monthlyOvertimeEmployees = [];
let monthlyOvertimeEntries = [];


function setCurrentOvertimeMonth(){

  const input =
    document.getElementById(
      "overtimeMonth"
    );

  if(!input){
    return;
  }

  const today = new Date();

  input.value =
    today.getFullYear() +
    "-" +
    String(
      today.getMonth() + 1
    ).padStart(2,"0");

}


function moveOvertimeMonth(direction){

  const input =
    document.getElementById(
      "overtimeMonth"
    );

  if(!input || !input.value){
    return;
  }

  const parts =
    input.value.split("-");

  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1 + direction,
      1
    );

  input.value =
    date.getFullYear() +
    "-" +
    String(
      date.getMonth() + 1
    ).padStart(2,"0");

  loadMonthlyOvertime();

}


async function loadMonthlyOvertime(){

  const monthInput =
    document.getElementById(
      "overtimeMonth"
    );

  const head =
    document.getElementById(
      "monthlyOvertimeHead"
    );

  const body =
    document.getElementById(
      "monthlyOvertimeBody"
    );

  const foot =
    document.getElementById(
      "monthlyOvertimeFoot"
    );

  if(
    !monthInput ||
    !head ||
    !body ||
    !foot
  ){
    return;
  }

  if(!monthInput.value){
    setCurrentOvertimeMonth();
  }

  body.innerHTML = `
    <tr>
      <td class="empty">
        월간 내역을 불러오는 중입니다.
      </td>
    </tr>
  `;

  try{

    const employeeResponse =
      await fetch(
        API_URL +
        "?action=employees&t=" +
        Date.now()
      );

    const employeeData =
      await employeeResponse.json();

    const listResponse =
      await fetch(
        API_URL +
        "?action=list&t=" +
        Date.now()
      );

    const listData =
      await listResponse.json();

    monthlyOvertimeEmployees =
      (employeeData.list || [])
      .filter(function(employee){

        return (
          !employee.status ||
          employee.status === "재직"
        );

      });

    monthlyOvertimeEntries =
      (listData.list || [])
      .filter(function(item){

        return String(
          item.workDate || ""
        ).slice(0,7) ===
          monthInput.value;

      })
      .filter(function(item){

        return [
          "초과근무",
          "미휴게",
          "휴무근무",
          "조퇴",
          "기타"
        ].includes(item.type);

      });

    renderMonthlyOvertimeTable();
    renderMonthlyOvertimeSummary();

  }catch(error){

    body.innerHTML = `
      <tr>
        <td class="empty">
          월간 내역 조회에 실패했습니다.
        </td>
      </tr>
    `;

  }

}


function renderMonthlyOvertimeTable(){

  const monthValue =
    document.getElementById(
      "overtimeMonth"
    ).value;

  const head =
    document.getElementById(
      "monthlyOvertimeHead"
    );

  const body =
    document.getElementById(
      "monthlyOvertimeBody"
    );

  const foot =
    document.getElementById(
      "monthlyOvertimeFoot"
    );

  const parts =
    monthValue.split("-");

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const lastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  if(!monthlyOvertimeEmployees.length){

    head.innerHTML = "";

    body.innerHTML = `
      <tr>
        <td class="empty">
          등록된 재직 직원이 없습니다.
        </td>
      </tr>
    `;

    foot.innerHTML = "";

    return;
  }

  head.innerHTML = `
    <tr>
      <th class="date-column">
        날짜
      </th>

      ${monthlyOvertimeEmployees
        .map(function(employee){

          return `
            <th>
              ${safe(employee.name)}
            </th>
          `;

        })
        .join("")}
    </tr>
  `;

  let bodyHtml = "";

  for(
    let day = 1;
    day <= lastDay;
    day++
  ){

    const workDate =
      year +
      "-" +
      String(month).padStart(2,"0") +
      "-" +
      String(day).padStart(2,"0");

    const weekday =
      new Date(
        year,
        month - 1,
        day
      ).getDay();

    const weekdayText =
      ["일","월","화","수","목","금","토"]
      [weekday];

    bodyHtml += `
      <tr>

        <td class="date-column">
          ${day}일
          <small>
            ${weekdayText}
          </small>
        </td>

        ${monthlyOvertimeEmployees
          .map(function(employee){

            return renderMonthlyCell(
              workDate,
              employee.name
            );

          })
          .join("")}

      </tr>
    `;

  }

  body.innerHTML = bodyHtml;

  foot.innerHTML = "";

}


function renderMonthlyCell(
  workDate,
  employeeName
){

  const entries =
    monthlyOvertimeEntries
    .filter(function(item){

      return (
        String(item.workDate) ===
          String(workDate) &&
        String(item.employeeName) ===
          String(employeeName)
      );

    });

  const totals = {
    "초과근무":0,
    "미휴게":0,
    "휴무근무":0,
    "조퇴":0,
    "기타":0
  };

  entries.forEach(function(item){

    if(
      Object.prototype.hasOwnProperty.call(
        totals,
        item.type
      )
    ){
      totals[item.type] +=
        Number(item.hours || 0);
    }

  });

  const badges = [];

  if(totals["초과근무"]){

    badges.push(`
      <span class=
        "monthly-entry-badge overtime">
        초과 ${formatWorkNumber(
          totals["초과근무"]
        )}h
      </span>
    `);

  }

  if(totals["미휴게"]){

    badges.push(`
      <span class=
        "monthly-entry-badge no-break">
        미휴게 ${formatWorkNumber(
          totals["미휴게"]
        )}h
      </span>
    `);

  }

  if(totals["휴무근무"]){

    badges.push(`
      <span class=
        "monthly-entry-badge holiday">
        휴무 ${formatWorkNumber(
          totals["휴무근무"]
        )}일
      </span>
    `);

  }

  if(totals["조퇴"]){

    badges.push(`
      <span class=
        "monthly-entry-badge early-leave">
        조퇴 ${formatWorkNumber(
          totals["조퇴"]
        )}h
      </span>
    `);

  }

  if(totals["기타"]){

    badges.push(`
      <span class=
        "monthly-entry-badge etc">
        기타 ${formatWorkNumber(
          totals["기타"]
        )}h
      </span>
    `);

  }

  return `
    <td
      class="monthly-overtime-cell"
      onclick="openMonthlyEntryModal(
        '${workDate}',
        '${encodeURIComponent(
          employeeName
        )}'
      )">

      ${
        badges.length
        ? badges.join("")
        : `
          <span class="monthly-cell-empty">
            ＋
          </span>
        `
      }

    </td>
  `;

}


function renderMonthlyOvertimeSummary(){

  const head =
    document.getElementById(
      "monthlySummaryHead"
    );

  const body =
    document.getElementById(
      "monthlySummaryBody"
    );

  if(
    !head ||
    !body ||
    !monthlyOvertimeEmployees.length
  ){
    return;
  }

  head.innerHTML = `
    <tr>
      <th>구분</th>

      ${monthlyOvertimeEmployees
        .map(function(employee){

          return `
            <th>
              ${safe(employee.name)}
            </th>
          `;

        })
        .join("")}

    </tr>
  `;

  const rows = [
    {
      type:"초과근무",
      label:"초과근무",
      unit:"시간"
    },
    {
      type:"미휴게",
      label:"미휴게",
      unit:"시간"
    },
    {
      type:"휴무근무",
      label:"휴무근무",
      unit:"일"
    },
    {
      type:"조퇴",
      label:"조퇴",
      unit:"시간"
    }
  ];

  let html =
    rows.map(function(row){

      return `
        <tr>

          <td>
            ${row.label}
          </td>

          ${monthlyOvertimeEmployees
            .map(function(employee){

              const total =
                getEmployeeMonthlyTypeTotal(
                  employee.name,
                  row.type
                );

              return `
                <td>
                  ${formatWorkNumber(total)}
                  ${row.unit}
                </td>
              `;

            })
            .join("")}

        </tr>
      `;

    }).join("");

  html += `
    <tr class="monthly-summary-total">

      <td>
        총 초과근무시간
      </td>

      ${monthlyOvertimeEmployees
        .map(function(employee){

          const overtime =
            getEmployeeMonthlyTypeTotal(
              employee.name,
              "초과근무"
            );

          const noBreak =
            getEmployeeMonthlyTypeTotal(
              employee.name,
              "미휴게"
            );

          const earlyLeave =
            getEmployeeMonthlyTypeTotal(
              employee.name,
              "조퇴"
            );

          const total =
            overtime +
            noBreak -
            earlyLeave;

          return `
            <td>
              ${formatWorkNumber(total)}
              시간
            </td>
          `;

        })
        .join("")}

    </tr>
  `;

  body.innerHTML = html;

}


function getEmployeeMonthlyTypeTotal(
  employeeName,
  type
){

  return monthlyOvertimeEntries
    .filter(function(item){

      return (
        String(item.employeeName) ===
          String(employeeName) &&
        item.type === type
      );

    })
    .reduce(function(sum,item){

      return (
        sum +
        Number(item.hours || 0)
      );

    },0);

}


function formatWorkNumber(value){

  const number =
    Number(value || 0);

  if(Number.isInteger(number)){
    return String(number);
  }

  return number.toFixed(1);

}


function openMonthlyEntryModal(
  workDate,
  encodedEmployeeName
){

  const employeeName =
    decodeURIComponent(
      encodedEmployeeName
    );

  const modal =
    document.getElementById(
      "monthlyEntryModal"
    );

  if(!modal){
    return;
  }

  document.getElementById(
    "monthlyModalDate"
  ).value = workDate;

  document.getElementById(
    "monthlyModalEmployee"
  ).value = employeeName;

  document.getElementById(
    "monthlyModalTitle"
  ).textContent =
    employeeName;

  document.getElementById(
    "monthlyModalSubTitle"
  ).textContent =
    workDate + " 근무내역";

  const entries =
    monthlyOvertimeEntries
    .filter(function(item){

      return (
        String(item.workDate) ===
          String(workDate) &&
        String(item.employeeName) ===
          String(employeeName)
      );

    });

  setMonthlyModalValue(
    "monthlyOvertimeHours",
    getEntryTotal(entries,"초과근무")
  );

  setMonthlyModalValue(
    "monthlyNoBreakHours",
    getEntryTotal(entries,"미휴게")
  );

  setMonthlyModalValue(
    "monthlyHolidayDays",
    getEntryTotal(entries,"휴무근무")
  );

  setMonthlyModalValue(
    "monthlyEarlyLeaveHours",
    getEntryTotal(entries,"조퇴")
  );

  setMonthlyModalValue(
    "monthlyEtcHours",
    getEntryTotal(entries,"기타")
  );

  const firstEntry =
    entries[0] || {};

  document.getElementById(
    "monthlyReason"
  ).value =
    firstEntry.reason || "";

  document.getElementById(
    "monthlyMemo"
  ).value =
    firstEntry.memo || "";

  modal.classList.remove("hidden");

  document.body.classList.add(
    "modal-open"
  );

}


function getEntryTotal(entries,type){

  return entries
    .filter(function(item){

      return item.type === type;

    })
    .reduce(function(sum,item){

      return (
        sum +
        Number(item.hours || 0)
      );

    },0);

}


function setMonthlyModalValue(
  elementId,
  value
){

  const element =
    document.getElementById(
      elementId
    );

  if(!element){
    return;
  }

  const stringValue =
    String(
      Number(value || 0)
    );

  const exists =
    Array.from(element.options)
    .some(function(option){

      return option.value ===
        stringValue;

    });

  element.value =
    exists
      ? stringValue
      : "0";

}


function closeMonthlyEntryModal(){

  const modal =
    document.getElementById(
      "monthlyEntryModal"
    );

  if(!modal){
    return;
  }

  modal.classList.add("hidden");

  document.body.classList.remove(
    "modal-open"
  );

}


async function saveMonthlyOvertimeCell(){

  const workDate =
    document.getElementById(
      "monthlyModalDate"
    ).value;

  const employeeName =
    document.getElementById(
      "monthlyModalEmployee"
    ).value;

  const overtimeHours =
    document.getElementById(
      "monthlyOvertimeHours"
    ).value;

  const noBreakHours =
    document.getElementById(
      "monthlyNoBreakHours"
    ).value;

  const holidayDays =
    document.getElementById(
      "monthlyHolidayDays"
    ).value;

  const earlyLeaveHours =
    document.getElementById(
      "monthlyEarlyLeaveHours"
    ).value;

  const etcHours =
    document.getElementById(
      "monthlyEtcHours"
    ).value;

  const reason =
    document.getElementById(
      "monthlyReason"
    ).value.trim();

  const memo =
    document.getElementById(
      "monthlyMemo"
    ).value.trim();


  if(!workDate || !employeeName){

    alert(
      "날짜 또는 직원정보가 없습니다."
    );

    return;
  }


  const saveButton =
    document.querySelector(
      ".modal-save-btn"
    );

  if(saveButton){

    saveButton.disabled = true;

    saveButton.textContent =
      "저장 중...";

  }


  const payload = {

    action: "saveMonthlyCell",

    workDate:
      workDate,

    employeeName:
      employeeName,

    overtimeHours:
      overtimeHours,

    noBreakHours:
      noBreakHours,

    holidayDays:
      holidayDays,

    earlyLeaveHours:
      earlyLeaveHours,

    etcHours:
      etcHours,

    reason:
      reason,

    memo:
      memo,

    writer:
      "한국의집",

    store:
      "한국의집 롯데월드몰점"

  };


  try{

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );

    const result =
      await response.json();


    if(!result.success){

      throw new Error(
        result.message ||
        "저장에 실패했습니다."
      );

    }


    closeMonthlyEntryModal();

    await loadMonthlyOvertime();

    alert(
      result.message ||
      "저장되었습니다."
    );


  }catch(error){

    alert(
      error.message ||
      "월간 내역 저장 중 오류가 발생했습니다."
    );


  }finally{

    if(saveButton){

      saveButton.disabled = false;

      saveButton.textContent =
        "저장";

    }

  }

}


document.addEventListener(
  "keydown",
  function(event){

    if(event.key === "Escape"){
      closeMonthlyEntryModal();
    }

  }
);