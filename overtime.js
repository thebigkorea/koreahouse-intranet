const API_URL =
  "https://script.google.com/macros/s/AKfycbyIR9zeGZz14r-5RjUeHL0amYXNVu7QaG-oQ6kmusge__3VZ7C94GW-6PT-B_V_asRT/exec";

window.addEventListener("load", () => {
  setToday();
  loadEmployees();
  loadList();

  const typeSelect =
    document.getElementById("type");

  if(typeSelect){
    typeSelect.addEventListener("change", changeUnitLabel);
    changeUnitLabel();
  }
});

function changeUnitLabel(){

  const type =
    document.getElementById("type").value;

  const label =
    document.getElementById("hoursLabel");

  const hours =
    document.getElementById("hours");

  if(!label || !hours) return;

  if(type === "휴무근무"){

    label.textContent = "일수";

    hours.innerHTML = `
      <option value="0.5">0.5일</option>
      <option value="1">1일</option>
      <option value="1.5">1.5일</option>
      <option value="2">2일</option>
      <option value="3">3일</option>
      <option value="4">4일</option>
    `;

  }else if(type === "조퇴"){

    label.textContent = "차감시간";

    hours.innerHTML = `
      <option value="0.5">0.5시간 차감</option>
      <option value="1">1시간 차감</option>
      <option value="1.5">1.5시간 차감</option>
      <option value="2">2시간 차감</option>
      <option value="2.5">2.5시간 차감</option>
      <option value="3">3시간 차감</option>
      <option value="4">4시간 차감</option>
    `;

  }else{

    label.textContent = "시간";

    hours.innerHTML = `
      <option value="0.5">0.5</option>
      <option value="1">1</option>
      <option value="1.5">1.5</option>
      <option value="2">2</option>
      <option value="2.5">2.5</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    `;
  }
}


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
          <td>${safe(item.hours)}시간</td>
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
    }else{
      alert(data.message || "직원 저장 실패");
    }

  }catch(e){
    alert("직원 저장 중 오류가 발생했습니다.");
  }
}