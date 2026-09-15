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

const CONTRACT_API_URL =
  'https://script.google.com/macros/s/AKfycbzCO4TLMRGgt_OY-3T92mw58AAKcOwquq0ubepUEJgPO9YPeMV-hNeP7AHy7lvOPog7oQ/exec';

const HEALTH_CERT_API_URL =
  'https://script.google.com/macros/s/AKfycby-FdNL_GsXFB4klTrk8fM6YB7Fgkoh0-we-D48z9o34d0OUy09PtHuAaCIAfngIqs7/exec';

const WEEKLY_SCHEDULE_API_URL =
  'https://script.google.com/macros/s/AKfycbyxNHxdt7xwXXp1OKib0PHHNc9qS1vXOlzaUCVsUJgqMmdpIcvVQsa2vY0hQgoSE-ab9Q/exec';

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

async function loadContractExpireBadge() {
  try {
    const response = await fetch(CONTRACT_API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getContractList' })
    });

    const data = await response.json();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = (data.contracts || []).filter(function (contract) {
      const end = parseContractDate(contract.endDate);
      if (!end) return false;

      end.setHours(0, 0, 0, 0);
      const days = Math.ceil((end - today) / 86400000);
      return days >= 0 && days <= 30;
    }).length;

    showBadge(['contractExpireBadge'], count);
    setStatusValue('statusContract', count);
  } catch (error) {
    console.log('계약 만료 배지 조회 실패', error);
  }
}

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

  try {
    const response = await fetch(
      WEEKLY_SCHEDULE_API_URL +
        '?action=getWeeklyScheduleBundle&monday=' +
        encodeURIComponent(monday) +
        '&t=' +
        Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const result = await response.json();
    if (!result.ok) throw new Error(result.message || '주간 근무표 조회 실패');

    const saved = result.data && result.data.schedule ? result.data.schedule : {};
    if (!saved.found) {
      if (valueEl) valueEl.textContent = '0명';
      if (descEl) descEl.textContent = '이번주 저장된 근무표 없음';
      if (countEl) countEl.textContent = '0명';
      if (listEl) {
        listEl.innerHTML = '<div class="attendance-empty">이번주 저장된 근무표가 없습니다.</div>';
      }
      return;
    }

    const schedule = saved.schedule || {};
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
        if (!name || seenNames.has(name)) return;

        seenNames.add(name);
        roleCounts[role] += 1;
        employees.push({
          name: name,
          time: String((item && item.time) || '').trim(),
          role: role
        });
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

      if (!employees.length) {
        const empty = document.createElement('div');
        empty.className = 'attendance-empty';
        empty.textContent = '오늘 근무 예정자가 없습니다.';
        listEl.appendChild(empty);
      } else {
        employees.forEach(function(employee) {
          const row = document.createElement('div');
          row.className = 'attendance-person';

          const info = document.createElement('div');
          info.className = 'attendance-person-info';

          const name = document.createElement('strong');
          name.textContent = employee.name;

          const time = document.createElement('small');
          time.textContent = employee.time ? '예정 ' + employee.time : '근무시간 미입력';

          const state = document.createElement('span');
          state.className = 'attendance-state working';
          state.textContent = roleLabels[employee.role] || '근무';

          info.append(name, time);
          row.append(info, state);
          listEl.appendChild(row);
        });
      }
    }
  } catch (error) {
    if (valueEl) valueEl.textContent = '-';
    if (descEl) descEl.textContent = '주간 스케줄 연결 확인 필요';
    if (countEl) countEl.textContent = '-';
    if (listEl) {
      listEl.innerHTML = '<div class="attendance-empty">오늘 근무 예정자 목록을 불러오지 못했습니다.</div>';
    }
    console.log('오늘 근무 예정자 조회 실패', error);
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
