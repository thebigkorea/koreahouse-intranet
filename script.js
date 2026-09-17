const todayEl = document.getElementById('today');
if (todayEl) {
  todayEl.textContent = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'full'
  }).format(new Date());
}

const PASSWORD = '1234';

function secureOpen(message, url) {
  const pw = prompt(message);
  if (pw === null) return;

  if (pw !== PASSWORD) {
    alert('비밀번호가 올바르지 않습니다.');
    return;
  }

  window.open(url, '_blank');
}

function openContractLedger() {
  secureOpen(
    '근로계약서 원장조회 비밀번호를 입력하세요.',
    'https://docs.google.com/spreadsheets/d/1sSKno2C3Gnvx-FwfEru_rsP0QWzliWcVEQIKe9vXFqc/edit'
  );
}

function openOvertimePage(url) {
  secureOpen('초과근무 관리 비밀번호를 입력하세요.', url);
}

function openHrLedger() {
  secureOpen(
    '인사관리대장 비밀번호를 입력하세요.',
    'https://thebigkorea.github.io/hr-system/hr-list.html'
  );
}

function openHrSheet() {
  secureOpen(
    '인사 원장조회 비밀번호를 입력하세요.',
    'https://docs.google.com/spreadsheets/d/1sSKno2C3Gnvx-FwfEru_rsP0QWzliWcVEQIKe9vXFqc/edit'
  );
}

function openApplicantSheet() {
  secureOpen(
    '지원자 원장조회 비밀번호를 입력하세요.',
    'https://docs.google.com/spreadsheets/d/1WgLVb-hTehmz2huM5e-gyds1s8aX-7eBhMCYVZEyFDM/edit'
  );
}

function openAttendanceAdmin() {
  secureOpen(
    '출퇴근 관리자 조회 비밀번호를 입력하세요.',
    'https://thebigkorea.github.io/koreahouse-attendance/admin.html'
  );
}

function openAttendanceManage() {
  secureOpen(
    '출퇴근 관리 비밀번호를 입력하세요.',
    'https://thebigkorea.github.io/koreahouse-attendance/admin.html'
  );
}

function openStaffList() {
  secureOpen(
    '직원 목록 비밀번호를 입력하세요.',
    'https://docs.google.com/spreadsheets/d/1y1f4noa90DCA_YxZYx9MXe_A523Z5g2raeLU4d4wwb4/edit'
  );
}

const RESERVATION_API_URL =
  'https://script.google.com/macros/s/AKfycbztW1jBJBIF9QxsXhJMmXfb24w1bPZCQbIormWPiEyiRIx2stbS3YmUABpbc4PtWnZ8/exec';

const MANAGEMENT_DASHBOARD_API_URL =
  'https://script.google.com/macros/s/AKfycbzX4BEypYJv6h-5FZBTCFx1iJfHk-3DPBIHO9yRJfUmdXyy6xATo7vGnjG_T1swabh7XQ/exec';

const KOREA_DAILY_WORKER_API_URL =
  'https://script.google.com/macros/s/AKfycbz_NFlMRhx_mP_0maccpd62iWNHGMVo-pAZCHg7s8-tM26QvKlIVrPL6TmElRgM6XIS/exec';

const APPLICANT_API_URL =
  'https://script.google.com/macros/s/AKfycbwNqmreZsa_YpzlTQxL4HzkklxxI1wie-ujq-BLeLgtUqPt-_ti4_W1MdbJ0Qf-eIaWJA/exec';

// 신규 더큰코리아 통합 전자계약 API
const CONTRACT_API_URL =
  'https://script.google.com/macros/s/AKfycbwRGQcXgYhfkTUiklPrHs4uFe7oHpgn8D_jM2jJPpU74tXr3D_h6vGMq72CHXU0EnAb/exec';

// 기존 한국의집 REG 전자근로계약 API
const LEGACY_CONTRACT_API_URL =
  'https://script.google.com/macros/s/AKfycbzCO4TLMRGgt_OY-3T92mw58AAKcOwquq0ubepUEJgPO9YPeMV-hNeP7AHy7lvOPog7oQ/exec';

const HEALTH_CERT_API_URL =
  'https://script.google.com/macros/s/AKfycby-FdNL_GsXFB4klTrk8fM6YB7Fgkoh0-we-D48z9o34d0OUy09PtHuAaCIAfngIqs7/exec';

const WEEKLY_SCHEDULE_API_URL =
  'https://script.google.com/macros/s/AKfycbyxNHxdt7xwXXp1OKib0PHHNc9qS1vXOlzaUCVsUJgqMmdpIcvVQsa2vY0hQgoSE-ab9Q/exec';

// 한국의집 실제 출퇴근 기록 API
const ATTENDANCE_API_URL =
  'https://script.google.com/macros/s/AKfycbz6rYVTUixqPOhHhethQcRI4ziwNukl8EcZx9nVvFLw0rV5o4kLD_BExlONS7WPGE54sQ/exec';

function setStatusValue(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = Number(count || 0) + '건';
}

function showBadge(ids, count) {
  const number = Number(count || 0);

  ids.forEach(function (id) {
    const badge = document.getElementById(id);
    if (!badge) return;

    if (number > 0) {
      badge.textContent = number > 99 ? '99+' : String(number);
      badge.style.setProperty('display', 'grid', 'important');
    } else {
      badge.textContent = '0';
      badge.style.setProperty('display', 'none', 'important');
    }
  });
}

async function loadTodayReservationCount() {
  const statusEl = document.getElementById('statusReservation');

  try {
    const response = await fetch(
      RESERVATION_API_URL +
        '?action=getTodayReservationCount&t=' +
        Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const data = await response.json();
    if (statusEl) statusEl.textContent = Number(data.count || 0) + '건';
  } catch (error) {
    if (statusEl) statusEl.textContent = '-';
    console.log('오늘 예약 건수 조회 실패', error);
  }
}

function formatWon(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

async function loadLatestPerformance() {
  const valueEl = document.getElementById('statusPerformance');
  const dateEl = document.getElementById('statusPerformanceDate');

  try {
    const response = await fetch(
      MANAGEMENT_DASHBOARD_API_URL +
        '?action=koreanHouseLatestSales&t=' +
        Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const data = await response.json();
    if (!data.ok) throw new Error(data.message || '영업실적 조회 실패');

    if (!data.dateKey) {
      if (valueEl) valueEl.textContent = '-';
      if (dateEl) dateEl.textContent = '입력된 영업실적 없음';
      return;
    }

    if (valueEl) valueEl.textContent = formatWon(data.sales);

    if (dateEl) {
      let description = data.dateLabel + ' 영업실적';

      if (data.changeRate !== null && data.changeRate !== undefined) {
        const sign = Number(data.changeRate) > 0 ? '+' : '';
        description += ' · 전주 동일요일 대비 ' + sign + data.changeRate + '%';
      }

      dateEl.textContent = description;
    }
  } catch (error) {
    if (valueEl) valueEl.textContent = '-';
    if (dateEl) dateEl.textContent = '영업실적 연결 확인 필요';
    console.log('최근 영업실적 조회 실패', error);
  }
}

async function loadDailyUnpaidBadges() {
  try {
    const response = await fetch(
      KOREA_DAILY_WORKER_API_URL +
        '?action=getDailyUnpaidCount&t=' +
        Date.now(),
      { cache: 'no-store' }
    );

    const data = await response.json();
    const count = Number(data.count || data.unpaidCount || 0);

    showBadge(
      [
        'koreaDailyUnpaidBadgeTop',
        'koreaDailyUnpaidBadge',
        'dailyUnpaidBadgeReport'
      ],
      count
    );
    setStatusValue('statusDaily', count);
  } catch (error) {
    console.log('일용직 미처리 배지 조회 실패', error);
  }
}

async function loadTodayInterviewBadge() {
  try {
    const response = await fetch(
      APPLICANT_API_URL +
        '?action=getTodayInterviewCount&t=' +
        Date.now(),
      { cache: 'no-store' }
    );

    const data = await response.json();
    const count = Number(data.count || 0);

    showBadge(['todayInterviewBadgeTop', 'todayInterviewBadge'], count);
    setStatusValue('statusInterview', count);
  } catch (error) {
    console.log('오늘 면접 배지 조회 실패', error);
  }
}

function parseContractDate(value) {
  if (!value) return null;

  const match = String(value)
    .trim()
    .match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

let CONTRACT_EXPIRE_ITEMS = [];

function normalizeContractText_(value) {
  return String(value || '').replace(/\s+/g, '').trim().toLowerCase();
}

function getContractName_(contract) {
  return contract.employeeName || contract.empName || contract.name || '';
}

function getContractStore_(contract) {
  return contract.store || contract.workplace || contract.workPlace || contract.department || '';
}

function getContractEndValue_(contract) {
  return contract.endDate || contract.contractEndDate || contract.periodEnd || '';
}

function getContractType_(contract) {
  return contract.contractType || contract.type || '근로계약';
}

function getContractLink_(contract, source) {
  if (contract.workerLink) return contract.workerLink;
  if (contract.contractUrl) return contract.contractUrl;
  if (contract.url) return contract.url;

  const id = contract.contractId || contract.contractNo || '';
  if (!id) return '';

  if (source === 'REG') {
    const type = getContractType_(contract);
    let page = 'regular-contract.html';
    if (type.includes('계약직') || type.includes('아르바이트')) page = 'part-contract.html';
    if (type.includes('용역') || type.includes('사업소득')) page = 'service-contract.html';
    return 'https://thebigkorea.github.io/hr-system/' + page + '?id=' + encodeURIComponent(id);
  }

  return 'https://thebigkorea.github.io/thebigkorea-hq/contract-view.html?id=' + encodeURIComponent(id);
}

function formatContractDate_(date) {
  if (!date) return '-';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

async function loadContractExpireBadge() {
  try {
    const [legacyResponse, newResponse] = await Promise.all([
      fetch(LEGACY_CONTRACT_API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getContractList' })
      }),
      fetch(CONTRACT_API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getContractList' })
      })
    ]);

    if (!legacyResponse.ok) throw new Error('기존 REG 계약 API HTTP ' + legacyResponse.status);
    if (!newResponse.ok) throw new Error('신규 통합계약 API HTTP ' + newResponse.status);

    const legacyData = await legacyResponse.json();
    const newData = await newResponse.json();

    const legacyContracts = Array.isArray(legacyData.contracts)
      ? legacyData.contracts
      : (Array.isArray(legacyData.rows) ? legacyData.rows : []);

    const newContracts = Array.isArray(newData.contracts)
      ? newData.contracts
      : (Array.isArray(newData.rows) ? newData.rows : []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const candidates = [];

    legacyContracts.forEach(function(contract) {
      candidates.push({ contract: contract, source: 'REG' });
    });

    newContracts.forEach(function(contract) {
      candidates.push({ contract: contract, source: 'NEW' });
    });

    const unique = new Map();

    candidates.forEach(function(item) {
      const contract = item.contract;
      const end = parseContractDate(getContractEndValue_(contract));
      if (!end) return;

      end.setHours(0, 0, 0, 0);
      const days = Math.ceil((end - today) / 86400000);
      if (days < 0 || days > 30) return;

      const name = getContractName_(contract);
      const store = getContractStore_(contract);
      const endKey = formatContractDate_(end);

      const id = contract.contractId || contract.contractNo || '';
      const key = name
        ? normalizeContractText_(name) + '|' + normalizeContractText_(store) + '|' + endKey
        : String(id) + '|' + endKey + '|' + item.source;

      if (!unique.has(key)) {
        unique.set(key, {
          id: id,
          name: name || '직원명 미등록',
          store: store || '소속 미등록',
          contractType: getContractType_(contract),
          endDate: endKey,
          days: days,
          source: item.source,
          sourceLabel: item.source === 'REG' ? '기존 REG 계약' : '신규 통합계약',
          link: getContractLink_(contract, item.source)
        });
      }
    });

    CONTRACT_EXPIRE_ITEMS = Array.from(unique.values()).sort(function(a, b) {
      return a.days - b.days || a.name.localeCompare(b.name, 'ko');
    });

    const count = CONTRACT_EXPIRE_ITEMS.length;
    showBadge(['contractExpireBadge'], count);
    setStatusValue('statusContract', count);
    renderContractExpireModal_();
  } catch (error) {
    CONTRACT_EXPIRE_ITEMS = [];
    renderContractExpireModal_('계약 만료 정보를 불러오지 못했습니다.');
    console.log('통합 계약 만료 배지 조회 실패', error);
  }
}

function renderContractExpireModal_(errorMessage) {
  const list = document.getElementById('contractExpireList');
  const countEl = document.getElementById('contractExpireModalCount');
  if (countEl) countEl.textContent = CONTRACT_EXPIRE_ITEMS.length + '건';
  if (!list) return;

  list.replaceChildren();

  if (errorMessage) {
    const empty = document.createElement('div');
    empty.className = 'contract-expire-empty';
    empty.textContent = errorMessage;
    list.appendChild(empty);
    return;
  }

  if (!CONTRACT_EXPIRE_ITEMS.length) {
    const empty = document.createElement('div');
    empty.className = 'contract-expire-empty';
    empty.textContent = '30일 이내 만료예정 계약이 없습니다.';
    list.appendChild(empty);
    return;
  }

  CONTRACT_EXPIRE_ITEMS.forEach(function(item) {
    const row = document.createElement('div');
    row.className = 'contract-expire-item';

    const main = document.createElement('div');
    main.className = 'contract-expire-main';

    const top = document.createElement('div');
    top.className = 'contract-expire-name-row';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const source = document.createElement('span');
    source.className = 'contract-source ' + (item.source === 'REG' ? 'legacy' : 'new');
    source.textContent = item.sourceLabel;

    top.append(name, source);

    const meta = document.createElement('div');
    meta.className = 'contract-expire-meta';
    meta.textContent = item.store + ' · ' + item.contractType;

    const date = document.createElement('div');
    date.className = 'contract-expire-date';
    date.textContent = '계약종료 ' + item.endDate;

    main.append(top, meta, date);

    const side = document.createElement('div');
    side.className = 'contract-expire-side';

    const dday = document.createElement('strong');
    dday.className = 'contract-dday';
    dday.textContent = item.days === 0 ? 'D-DAY' : 'D-' + item.days;
    side.appendChild(dday);

    if (item.link) {
      const link = document.createElement('a');
      link.className = 'contract-expire-link';
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '계약서 보기';
      side.appendChild(link);
    }

    row.append(main, side);
    list.appendChild(row);
  });
}

function openContractExpireModal() {
  const modal = document.getElementById('contractExpireModal');
  if (!modal) return;
  renderContractExpireModal_();
  modal.hidden = false;
  document.body.classList.add('contract-modal-open');
}

function closeContractExpireModal() {
  const modal = document.getElementById('contractExpireModal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('contract-modal-open');
}

function openContractExpireModalByKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openContractExpireModal();
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeContractExpireModal();
});

async function loadHealthCertBadge() {
  try {
    const response = await fetch(
      HEALTH_CERT_API_URL + '?action=badge&t=' + Date.now(),
      { cache: 'no-store' }
    );

    const data = await response.json();
    const count = Number(data.count || 0);

    showBadge(['healthCertBadge', 'healthCertBadgeTop'], count);
    setStatusValue('statusHealth', count);
  } catch (error) {
    console.log('보건증 배지 조회 실패', error);
  }
}

function getMondayDateKey_(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + dd;
}

async function loadTodayAttendanceSummary() {
  const valueEl = document.getElementById('statusAttendance');
  const descEl = document.getElementById('statusAttendanceDesc');
  const countEl = document.getElementById('attendanceRosterCount');
  const listEl = document.getElementById('attendanceNameList');

  const today = new Date();
  const monday = getMondayDateKey_(today);
  const dayIndex = (today.getDay() + 6) % 7; // 월=0 ... 일=6

  const roleLabels = {
    hall: '홀',
    kitchen: '주방',
    prep: '전처리',
    exit: '퇴식',
    wash: '설거지'
  };

  // 이름 비교 시 공백 차이 때문에 누락되지 않도록 정규화
  function nameKey_(name) {
    return String(name || '').replace(/\s+/g, '').trim();
  }

  // HH:mm:ss -> HH:mm
  function shortTime_(value) {
    const s = String(value || '').trim();
    if (!s) return '';
    const m = s.match(/(\d{1,2}):(\d{2})/);
    return m ? String(m[1]).padStart(2, '0') + ':' + m[2] : s;
  }

  try {
    // 주간 예정표 + 실제 출퇴근 기록을 동시에 조회
    const [scheduleResponse, attendanceResponse] = await Promise.all([
      fetch(
        WEEKLY_SCHEDULE_API_URL +
          '?action=getWeeklyScheduleBundle&monday=' +
          encodeURIComponent(monday) +
          '&t=' +
          Date.now(),
        { cache: 'no-store' }
      ),
      fetch(
        ATTENDANCE_API_URL +
          '?action=getTodayAttendanceSummary&t=' +
          Date.now(),
        { cache: 'no-store' }
      )
    ]);

    if (!scheduleResponse.ok) throw new Error('주간 스케줄 HTTP ' + scheduleResponse.status);
    if (!attendanceResponse.ok) throw new Error('출퇴근 HTTP ' + attendanceResponse.status);

    const result = await scheduleResponse.json();
    const attendanceResult = await attendanceResponse.json();

    if (!result.ok) throw new Error(result.message || '주간 근무표 조회 실패');
    if (!attendanceResult.success) throw new Error(attendanceResult.message || '출퇴근 기록 조회 실패');

    const saved = result.data && result.data.schedule ? result.data.schedule : {};
    const schedule = saved.found ? (saved.schedule || {}) : {};
    const todaySchedule = schedule[String(dayIndex)] || schedule[dayIndex] || {};
    const roles = ['hall', 'kitchen', 'prep', 'exit', 'wash'];

    const employees = [];
    const seenNames = new Set();
    const roleCounts = {};

    roles.forEach(function(role) {
      const items = Array.isArray(todaySchedule[role]) ? todaySchedule[role] : [];
      roleCounts[role] = 0;

      items.forEach(function(item) {
        const name = String((item && item.name) || '').trim();
        const key = nameKey_(name);
        if (!name || seenNames.has(key)) return;

        seenNames.add(key);
        roleCounts[role] += 1;
        employees.push({
          name: name,
          time: String((item && item.time) || '').trim(),
          role: role
        });
      });
    });

    // 실제 출퇴근 기록을 이름 기준으로 맵 구성
    const actualEmployees = Array.isArray(attendanceResult.employees)
      ? attendanceResult.employees
      : [];

    const actualMap = new Map();
    actualEmployees.forEach(function(item) {
      const key = nameKey_(item.name);
      if (!key) return;
      actualMap.set(key, {
        name: String(item.name || '').trim(),
        checkIn: shortTime_(item.checkIn),
        checkOut: shortTime_(item.checkOut),
        status: String(item.status || '').trim()
      });
    });

    const count = employees.length;
    if (valueEl) valueEl.textContent = count + '명';
    if (countEl) countEl.textContent = count + '명';

    if (descEl) {
      const parts = [];
      if (roleCounts.hall) parts.push('홀 ' + roleCounts.hall + '명');
      if (roleCounts.kitchen || roleCounts.prep) {
        parts.push('주방 ' + ((roleCounts.kitchen || 0) + (roleCounts.prep || 0)) + '명');
      }
      if (roleCounts.exit) parts.push('퇴식 ' + roleCounts.exit + '명');
      if (roleCounts.wash) parts.push('설거지 ' + roleCounts.wash + '명');
      descEl.textContent = parts.length ? parts.join(' · ') : '주간 근무표 기준';
    }

    if (listEl) {
      listEl.replaceChildren();

      if (!employees.length && !actualEmployees.length) {
        const empty = document.createElement('div');
        empty.className = 'attendance-empty';
        empty.textContent = saved.found
          ? '오늘 근무 예정자가 없습니다.'
          : '이번주 저장된 근무표가 없습니다.';
        listEl.appendChild(empty);
      }

      // ① 예정자 목록: 예정시간 + 실제 출근/퇴근시간 표시
      employees.forEach(function(employee) {
        const actual = actualMap.get(nameKey_(employee.name));

        const row = document.createElement('div');
        row.className = 'attendance-person';

        const info = document.createElement('div');
        info.className = 'attendance-person-info';

        const personMain = document.createElement('div');
        personMain.className = 'attendance-person-main';

        const avatar = document.createElement('span');
        avatar.className = 'attendance-avatar role-' + employee.role;
        avatar.textContent = employee.name ? employee.name.charAt(0) : '직';

        const name = document.createElement('strong');
        name.textContent = employee.name;

        const time = document.createElement('small');
        const scheduleText = employee.time ? '예정 ' + employee.time : '근무시간 미입력';

        if (actual && actual.checkOut) {
          time.textContent =
            scheduleText +
            ' · 출근 ' + (actual.checkIn || '-') +
            ' · 퇴근 ' + actual.checkOut;
        } else if (actual && actual.checkIn) {
          time.textContent = scheduleText + ' · 출근 ' + actual.checkIn;
        } else {
          time.textContent = scheduleText + ' · 미출근';
        }

        const state = document.createElement('span');

        if (actual && actual.checkOut) {
          state.className = 'attendance-state';
          state.textContent = '퇴근';
          state.style.background = '#eef2ff';
          state.style.color = '#4055a8';
        } else if (actual && actual.checkIn) {
          state.className = 'attendance-state working';
          state.textContent = '출근';
        } else {
          state.className = 'attendance-state';
          state.textContent = roleLabels[employee.role] || '예정';
        }

        info.append(name, time);
        personMain.append(avatar, info);
        row.append(personMain, state);
        listEl.appendChild(row);

        // 예정자와 매칭된 실제 출근자는 "예정 외 출근" 대상에서 제외
        if (actual) actualMap.delete(nameKey_(employee.name));
      });

      // ② 근무표에는 없지만 실제 출근한 사람을 별도 경고 영역으로 표시
      const unexpected = Array.from(actualMap.values()).filter(function(item) {
        return !!item.checkIn;
      });

      if (unexpected.length) {
        const warningTitle = document.createElement('div');
        warningTitle.textContent = '⚠ 예정 외 출근 ' + unexpected.length + '명';
        warningTitle.style.cssText =
          'margin:10px 0 6px;padding:8px 10px;border-radius:9px;' +
          'background:#fff1f0;color:#b42318;font-size:12px;font-weight:900;';
        listEl.appendChild(warningTitle);

        unexpected.forEach(function(actual) {
          const row = document.createElement('div');
          row.className = 'attendance-person';
          row.style.borderColor = '#f4b7b2';
          row.style.background = '#fff8f7';

          const info = document.createElement('div');
          info.className = 'attendance-person-info';

          const personMain = document.createElement('div');
          personMain.className = 'attendance-person-main';

          const avatar = document.createElement('span');
          avatar.className = 'attendance-avatar unexpected';
          avatar.textContent = actual.name ? actual.name.charAt(0) : '직';

          const name = document.createElement('strong');
          name.textContent = actual.name;

          const time = document.createElement('small');
          time.textContent = actual.checkOut
            ? '출근 ' + actual.checkIn + ' · 퇴근 ' + actual.checkOut
            : '출근 ' + actual.checkIn + ' · 근무표 미등록';

          const state = document.createElement('span');
          state.className = 'attendance-state';
          state.textContent = '예정 외';
          state.style.background = '#fee4e2';
          state.style.color = '#b42318';

          info.append(name, time);
          personMain.append(avatar, info);
          row.append(personMain, state);
          listEl.appendChild(row);
        });
      }
    }
  } catch (error) {
    if (valueEl) valueEl.textContent = '-';
    if (descEl) descEl.textContent = '주간 스케줄·출퇴근 연결 확인 필요';
    if (countEl) countEl.textContent = '-';
    if (listEl) {
      listEl.innerHTML =
        '<div class="attendance-empty">오늘 근무 예정자/실제 출근 기록을 불러오지 못했습니다.</div>';
    }
    console.log('오늘 근무 예정자/실제 출근 조회 실패', error);
  }
}

const now = new Date();
const month = String(now.getMonth() + 1).padStart(2, '0');
const monthInput = document.getElementById('baseMonth');

if (monthInput) {
  monthInput.value = now.getFullYear() + '-' + month;
}

document.querySelectorAll('.side-link,.side-home').forEach(function (link) {
  link.addEventListener('click', function () {
    document.body.classList.remove('menu-open');
  });
});

/* ===== ERP 좌측 메뉴 화면 전환 ===== */
const ERP_PAGES = {
  home: {
    title: 'ERP 홈',
    desc: '한국의집 매장 운영현황과 주요 업무를 한눈에 확인합니다.'
  },
  reservation: {
    title: '예약 · 고객',
    desc: '예약, 고객 CRM 및 문자 업무를 관리합니다.'
  },
  daily: {
    title: '일용직 · 알바 등록',
    desc: '일용직 및 아르바이트 근로내역과 지급을 관리합니다.'
  },
  schedule: {
    title: '근무스케줄',
    desc: '주간·월간 근무표와 스케줄 원장을 관리합니다.'
  },
  attendance: {
    title: '근태 · 휴가',
    desc: '출퇴근, 초과근무 및 연월차 업무를 관리합니다.'
  },
  store: {
    title: '매장관리',
    desc: '한국의집 매장 운영 입력과 주요 관리 원장을 확인합니다.'
  },
  recruit: {
    title: '채용 · 퇴직',
    desc: '지원자, 면접, 외국인 비자 및 퇴직 업무를 관리합니다.'
  },
  contract: {
    title: '전자계약',
    desc: '근로계약서와 재직·경력 증명 업무를 관리합니다.'
  },
  hr: {
    title: '통합인사',
    desc: '직원정보, 인사대장 및 보건증을 관리합니다.'
  },
  order: {
    title: '발주관리',
    desc: '식자재와 비품 발주 업무를 관리합니다.'
  },
  performance: {
    title: '매출실적',
    desc: '일일 영업실적 입력과 경영 대시보드를 확인합니다.'
  },
  payroll: {
    title: '급여관리',
    desc: '한국의집 직원 급여를 조회·계산·확정합니다.'
  },
  ledger: {
    title: '원장 · 자료',
    desc: '인사·지원자·계약·퇴직 관련 원장과 관리자 자료를 조회합니다.'
  }
};

function showErpPage(pageId, updateHash = true) {
  const page = ERP_PAGES[pageId] ? pageId : 'home';
  const isHome = page === 'home';
  const homeViews = document.querySelectorAll('.home-view');
  const workArea = document.getElementById('workArea');
  const modules = document.querySelectorAll('#workArea .module');

  homeViews.forEach(function (el) {
    el.hidden = !isHome;
  });

  if (workArea) workArea.hidden = isHome;

  modules.forEach(function (el) {
    el.hidden = isHome || el.id !== page;
  });

  const meta = ERP_PAGES[page];
  const title = document.getElementById('pageTitle');
  const desc = document.getElementById('pageDesc');

  if (title) title.textContent = meta.title;
  if (desc) desc.textContent = meta.desc;

  document.querySelectorAll('.side-home,.side-link').forEach(function (link) {
    const target = (link.getAttribute('href') || '').replace('#', '');
    link.classList.toggle('active', target === page);
  });

  document.body.classList.remove('menu-open');
  window.scrollTo({ top: 0, behavior: 'auto' });

  if (updateHash && location.hash !== '#' + page) {
    history.replaceState(null, '', '#' + page);
  }
}

document.querySelectorAll('.side-home,.side-link').forEach(function (link) {
  link.addEventListener('click', function (event) {
    const page = (this.getAttribute('href') || '').replace('#', '');

    if (ERP_PAGES[page]) {
      event.preventDefault();
      showErpPage(page);
    }
  });
});

window.addEventListener('hashchange', function () {
  showErpPage((location.hash || '#home').slice(1), false);
});

document.addEventListener('DOMContentLoaded', function () {
  loadTodayReservationCount();
  loadTodayAttendanceSummary();
  loadDailyUnpaidBadges();
  loadTodayInterviewBadge();
  loadContractExpireBadge();
  loadHealthCertBadge();

  showErpPage((location.hash || '#home').slice(1), false);
});
