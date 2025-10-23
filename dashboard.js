// dashboard.js - consolidated: navigation, cards, CGPA generator & calculator
document.addEventListener("DOMContentLoaded", () => {
    /* ==========================
       NAV, HOME & CARD HANDLING
       ========================== */
    const navItems = document.querySelectorAll(".sidebar ul li");
    const sections = document.querySelectorAll(".content section");
    const cards = document.querySelectorAll(".card");
    const homeCards = document.querySelectorAll(".home-card");
    const sidebarLinks = document.querySelectorAll(".sidebar ul li");
  
    // Load student info from localStorage (or defaults)
    const studentName = localStorage.getItem("studentName") || "Student";
    const regNumber = localStorage.getItem("regNumber") || "FUTO/XXXX/XXXXX";
    const department = localStorage.getItem("department") || "Not Set";
    const level = localStorage.getItem("level") || "N/A";
  
    const studentNameEl = document.getElementById("studentName");
    const welcomeP = document.querySelector(".welcome-header p");
    if (studentNameEl) studentNameEl.textContent = studentName;
    if (welcomeP)
      welcomeP.innerHTML = `Reg Number: <strong>${regNumber}</strong> | Department: <strong>${department}</strong> | Level: <strong>${level}</strong>`;
  
    // Default view: show Dashboard Home
    sections.forEach((sec) => sec.classList.add("hidden"));
    const homeSec = document.getElementById("home");
    if (homeSec) {
      homeSec.classList.remove("hidden");
      homeSec.classList.add("active-section");
    }
  
    // Helper: show section by id and update sidebar active state
    function showSection(id) {
      sections.forEach((sec) => {
        sec.classList.add("hidden");
        sec.classList.remove("active-section");
      });
      const target = document.getElementById(id);
      if (target) {
        target.classList.remove("hidden");
        target.classList.add("active-section");
      }
      sidebarLinks.forEach((link) =>
        link.classList.toggle("active", link.dataset.section === id)
      );
    }
  
    // Sidebar clicks
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (item.id === "logout") {
          alert("Logging out...");
          localStorage.clear();
          window.location.href = "index.html";
          return;
        }
        const sectionId = item.getAttribute("data-section");
        if (!sectionId) return;
        showSection(sectionId);
        navItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
      });
    });
  
    // Dashboard card clicks (cards in home)
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const target = card.getAttribute("data-target");
        if (!target) return;
        navItems.forEach((i) => i.classList.remove("active"));
        showSection(target);
        const match = document.querySelector(`[data-section="${target}"]`);
        if (match) match.classList.add("active");
      });
    });
  
    // home-card clicks
    homeCards.forEach((card) => {
      card.addEventListener("click", () => {
        const target = card.dataset.target;
        if (!target) return;
        showSection(target);
        const match = document.querySelector(`[data-section="${target}"]`);
        if (match) {
          navItems.forEach((i) => i.classList.remove("active"));
          match.classList.add("active");
        }
      });
    });
  
    /* ==========================
       CGPA GENERATOR & CALCULATOR
       ========================== */
    const generateBtn = document.getElementById("generateTable");
    const calcBtn = document.getElementById("calcCGPA");
    const courseCountInput = document.getElementById("courseCount");
    const tableContainer = document.getElementById("cgpaTableContainer");
    const resultOutput = document.getElementById("resultOutput");
    const cgpaSection = document.getElementById("cgpa");
  
    // small helper for button spinner/text handling
    function setButtonLoading(btn, loadingText) {
      if (!btn) return;
      btn.classList.add("loading");
      btn._prevText = btn.textContent;
      btn.innerHTML = `<span class="btn-spinner"></span> ${loadingText}`;
    }
    function clearButtonLoading(btn) {
      if (!btn) return;
      btn.classList.remove("loading");
      if (btn._prevText !== undefined) {
        btn.textContent = btn._prevText;
        delete btn._prevText;
      }
    }
  
    function clearResultsArea() {
      if (resultOutput) resultOutput.textContent = "";
    }
  
    // Generate Table handler
    if (generateBtn) {
      generateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Hide Performance Metrics and reset button if it exists
  const perfBox = document.getElementById("performanceMetrics");
  if (perfBox) perfBox.remove();
  if (performanceBtn) performanceBtn.remove();
  performanceDisplayed = false;
  
        const courseCount = parseInt(courseCountInput.value, 10);
        if (!courseCount || courseCount < 1)
          return alert("Please enter a valid number of courses (1–10).");
        if (courseCount > 10)
          return alert("You can only calculate for up to 10 courses.");
  
        clearResultsArea();
        setButtonLoading(generateBtn, "Generating...");
  
        setTimeout(() => {
          clearButtonLoading(generateBtn);
  
          let tableHTML = `<table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Unit</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>`;
          for (let i = 0; i < courseCount; i++) {
            tableHTML += `
              <tr>
                <td><input type="text" class="course-code" placeholder="e.g. CSC${200 + i}" required></td>
                <td><input type="number" class="course-unit" min="1" max="6" placeholder="Unit" required></td>
                <td>
                  <select class="course-grade" required>
                    <option value="">Select</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </td>
              </tr>`;
          }
          tableHTML += `</tbody></table>`;
  
          tableContainer.innerHTML = tableHTML;
          if (calcBtn) calcBtn.style.display = "block";
          if (cgpaSection) cgpaSection.style.height = "auto";
        }, 700);
      });
    }
  
    /* ==========================
       CALCULATE CGPA + PERFORMANCE
       ========================== */
    let performanceBtn = null;
    let performanceDisplayed = false;
  
    function resetPerformanceMetrics() {
      const chart = document.getElementById("performanceMetrics");
      if (chart) chart.remove();
      performanceDisplayed = false;
      if (performanceBtn) performanceBtn.disabled = false;
    }
  
    function showPerformanceButton(cgpa) {
      if (performanceBtn) performanceBtn.remove();
  
      performanceBtn = document.createElement("button");
      performanceBtn.textContent = "View Performance Metrics";
      performanceBtn.className = "performance-btn";
      performanceBtn.dataset.cgpa = cgpa;
  
      const resultOutput = document.getElementById("resultOutput");
      resultOutput.insertAdjacentElement("afterend", performanceBtn);
  
      performanceBtn.addEventListener("click", () => {
        if (performanceDisplayed) return;
        performanceDisplayed = true;
        displayPerformanceChart(parseFloat(performanceBtn.dataset.cgpa));
        performanceBtn.disabled = true;
        performanceBtn.style.opacity = "0.6";
      });
    }
  
    function displayPerformanceChart(cgpa) {
      const container = document.createElement("div");
      container.id = "performanceMetrics";
      container.classList.add("performance-box");
  
      let color, title, remark;
  
      if (cgpa >= 4.5) {
        color = "#00C853";
        title = " First Class";
        remark = "Excellent Academic Distinction — keep up the outstanding work!";
      } else if (cgpa >= 3.5) {
        color = "#64DD17";
        title = " Second Class Upper";
        remark = "Very Good Performance — impressive academic effort.";
      } else if (cgpa >= 2.4) {
        color = "#FFEB3B";
        title = " Second Class Lower";
        remark = "Good Performance — solid understanding of coursework.";
      } else if (cgpa >= 1.5) {
        color = "#FF9800";
        title = " Third Class";
        remark = "Below Average — improvement strongly advised.";
      } else if (cgpa >= 1.0) {
        color = "#FF5722";
        title = " Pass";
        remark = "Barely Passing — you need to study harder.";
      } else {
        color = "#F44336";
        title = " Fail";
        remark = "Failure — serious academic improvement required.";
      }
  
      const radius = 70;
      const circumference = 2 * Math.PI * radius;
      const percent = Math.min(100, (cgpa / 5) * 100);
      const offset = circumference - (percent / 100) * circumference;
  
      container.innerHTML = `
        <svg class="circular-chart" width="160" height="160" viewBox="0 0 160 160">
          <circle class="circle-bg" cx="80" cy="80" r="70"></circle>
          <circle class="circle" cx="80" cy="80" r="70" stroke="${color}"
            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}">
          </circle>
          <text x="80" y="90" class="chart-text">CGPA: ${cgpa.toFixed(2)} / 5.00</text>
        </svg>
        <h3 style="color:${color};">${title}</h3>
        <p>${remark}</p>
      `;
  
      const resultOutput = document.getElementById("resultOutput");
      resultOutput.insertAdjacentElement("afterend", container);
  
      const circle = container.querySelector(".circle");
      setTimeout(() => {
        circle.style.strokeDashoffset = offset;
      }, 200);
    }
  
    // === Calculate CGPA handlewer ===
    if (calcBtn) {
      calcBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearResultsArea();
        resetPerformanceMetrics();
  
        setButtonLoading(calcBtn, "Calculating...");
  
        setTimeout(() => {
          const unitEls = document.querySelectorAll(".course-unit");
          const gradeEls = document.querySelectorAll(".course-grade");
          const codeEls = document.querySelectorAll(".course-code");
  
          let totalUnits = 0;
          let totalPoints = 0;
  
          for (let i = 0; i < unitEls.length; i++) {
            const code = codeEls[i]?.value.trim();
            const unit = parseFloat(unitEls[i].value);
            const grade = gradeEls[i]?.value;
  
            if (!code || !unit || !grade) {
              clearButtonLoading(calcBtn);
              alert("Please fill every Course Code, Unit and Grade before calculating.");
              return;
            }
  
            totalUnits += unit;
            if (totalUnits > 24) {
              clearButtonLoading(calcBtn);
              alert("Total units exceed 24. Please reduce your units to 24 or less.");
              return;
            }
  
            const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
            totalPoints += (gradePoints[grade] || 0) * unit;
          }
  
          if (totalUnits === 0) {
            clearButtonLoading(calcBtn);
            alert("No units entered. Please provide course units.");
            return;
          }
  
          const cgpa = totalPoints / totalUnits;
          if (resultOutput) {
            resultOutput.innerHTML = `<strong>Your CGPA is: ${cgpa.toFixed(2)}</strong>`;
          }
  
          clearButtonLoading(calcBtn);
          showPerformanceButton(cgpa);
        }, 900);
      });
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "reading_plan_v4";
    let plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  
    const daysGrid = document.getElementById("daysGrid");
    const dayPlanner = document.getElementById("dayPlanner");
    const dayTitle = document.getElementById("dayTitle");
    const backToDays = document.getElementById("backToDays");
    const addSessionBtn = document.getElementById("addSessionBtn");
    const sessionForm = document.getElementById("sessionForm");
    const sessionList = document.getElementById("sessionList");
    const subjectInput = document.getElementById("sessionSubject");
    const startTime = document.getElementById("sessionStart");
    const endTime = document.getElementById("sessionEnd");
  
    let currentDay = null;
  
    const saveToStorage = () =>
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  
    // Simple ding sound for alerts
    const ding = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3"
    );
  
    // Switch to planner view
    daysGrid.querySelectorAll(".day-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentDay = btn.dataset.day;
        dayTitle.textContent = `${currentDay}'s Reading Plan`;
        daysGrid.classList.add("hidden");
        dayPlanner.classList.remove("hidden");
        renderSessions();
      });
    });
  
    backToDays.addEventListener("click", () => {
      dayPlanner.classList.add("hidden");
      daysGrid.classList.remove("hidden");
    });
  
    addSessionBtn.addEventListener("click", () => {
      sessionForm.classList.toggle("hidden");
    });
  
    sessionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newSession = {
        id: Date.now(),
        subject: subjectInput.value,
        start: startTime.value,
        end: endTime.value,
        done: false,
        notified: false,
      };
      if (!plans[currentDay]) plans[currentDay] = [];
      plans[currentDay].push(newSession);
      saveToStorage();
      sessionForm.reset();
      sessionForm.classList.add("hidden");
      renderSessions();
    });
  
    // Core display function
    function renderSessions() {
      sessionList.innerHTML = "";
      const sessions = plans[currentDay] || [];
  
      sessions.forEach((s) => {
        const li = document.createElement("li");
        li.className = `session-card ${s.done ? "done" : ""}`;
        const now = new Date();
        const today = new Date();
        const start = new Date(today.toDateString() + " " + s.start);
        const end = new Date(today.toDateString() + " " + s.end);
  
        let statusText = "Not yet time";
        let btnDisabled = true;
  
        if (now >= start && now < end && !s.done) {
          statusText = "Start Timer";
          btnDisabled = false;
  
          // Play alert sound once when it's time to start
          if (!s.notified) {
            ding.play();
            alert(`📚 Time to start reading: ${s.subject}!`);
            s.notified = true;
            saveToStorage();
          }
        } else if (now >= end && !s.done) {
          s.done = true;
          statusText = "Completed";
          saveToStorage();
        } else if (s.done) {
          statusText = "Completed";
        }
  
        li.innerHTML = `
          <div class="session-info">
            <strong>${s.subject}</strong>
            <small>${s.start} - ${s.end}</small>
            <div class="timer-display" id="timer-${s.id}"></div>
          </div>
          <div class="session-actions">
            <button class="btn-timer" ${btnDisabled ? "disabled" : ""}>
              ${statusText}
            </button>
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        `;
  
        const timerBtn = li.querySelector(".btn-timer");
        const timerDisplay = li.querySelector(`#timer-${s.id}`);
  
        // Timer Function
        timerBtn.addEventListener("click", () => {
          timerBtn.disabled = true;
          timerBtn.textContent = "Running...";
          const interval = setInterval(() => {
            const remaining = end - new Date();
            if (remaining <= 0) {
              clearInterval(interval);
              s.done = true;
              timerBtn.textContent = "Completed";
              timerDisplay.textContent = "✅ Done";
              saveToStorage();
              renderSessions();
            } else {
              const mins = Math.floor((remaining / 1000 / 60) % 60);
              const hrs = Math.floor((remaining / 1000 / 60 / 60) % 24);
              const secs = Math.floor((remaining / 1000) % 60);
              timerDisplay.textContent = `⏳ ${hrs}h ${mins}m ${secs}s left`;
            }
          }, 1000);
        });
  
        // Edit
        li.querySelector(".btn-edit").addEventListener("click", () => {
          const newSub = prompt("Edit subject:", s.subject);
          const newStart = prompt("Edit start:", s.start);
          const newEnd = prompt("Edit end:", s.end);
          if (newSub) s.subject = newSub;
          if (newStart) s.start = newStart;
          if (newEnd) s.end = newEnd;
          s.done = false;
          s.notified = false;
          saveToStorage();
          renderSessions();
        });
  
        // Delete
        li.querySelector(".btn-delete").addEventListener("click", () => {
          if (confirm("Delete this plan?")) {
            plans[currentDay] = sessions.filter((x) => x.id !== s.id);
            saveToStorage();
            renderSessions();
          }
        });
  
        sessionList.appendChild(li);
      });
    }
  
    // Auto-refresh every 30 seconds to update buttons & alerts
    setInterval(() => {
      if (currentDay) renderSessions();
    }, 30000);
  });
  
// ====== READING PLAN SCRIPT ======
document.addEventListener("DOMContentLoaded", function () {
  const readingForm = document.getElementById("readingForm");
  const readingList = document.getElementById("readingList");

  // Create reading plan card
  readingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const subject = document.getElementById("subject").value.trim();
    const dateTimeInput = document.getElementById("time").value;

    if (!subject || !dateTimeInput) {
      alert("Please enter both subject and time!");
      return;
    }

    const startTime = new Date(dateTimeInput);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

    const card = document.createElement("li");
    card.classList.add("reading-plan-card");
    card.dataset.start = startTime.toISOString();
    card.dataset.end = endTime.toISOString();

    card.innerHTML = `
      <div class="card-header">
        <h3>${subject}</h3>
        <p>${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
           ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      <div class="timer-display">🕒 Pending...</div>
      <div class="card-actions">
        <button class="mark-done">Mark Done</button>
        <button class="delete-card">Delete</button>
      </div>
    `;

    readingList.appendChild(card);
    readingForm.reset();
    updateTimers(); // immediately refresh
  });

  // Delete or mark as done
  readingList.addEventListener("click", function (e) {
    const card = e.target.closest(".reading-plan-card");
    if (e.target.classList.contains("delete-card")) {
      card.remove();
    } else if (e.target.classList.contains("mark-done")) {
      card.querySelector(".timer-display").textContent = "✅ Marked as Done";
      card.classList.add("done");
      card.classList.remove("active", "upcoming");
    }
  });

  // Update timer and UI states
  function updateTimers() {
    const plans = document.querySelectorAll(".reading-plan-card");
    const now = new Date();

    plans.forEach(plan => {
      const start = new Date(plan.dataset.start);
      const end = new Date(plan.dataset.end);
      const timerDisplay = plan.querySelector(".timer-display");

      plan.classList.remove("active", "upcoming", "completed");

      if (plan.classList.contains("done")) return; // skip done cards

      if (now >= start && now < end) {
        plan.classList.add("active");
        const remaining = end - now;
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        const seconds = Math.floor((remaining / 1000) % 60);
        timerDisplay.textContent = `⏱ ${minutes}m ${seconds}s left`;
      } else if (now >= end) {
        plan.classList.add("completed");
        timerDisplay.textContent = "✅ Session completed";
      } else {
        plan.classList.add("upcoming");
        const minsLeft = Math.ceil((start - now) / 60000);
        timerDisplay.textContent = `🕒 Starts in ${minsLeft} min`;
      }
    });
  }

  // Refresh every 15 seconds
  setInterval(updateTimers, 15000);
});

const readingSection = document.querySelector('.reading-section');
const dayButtons = document.querySelectorAll('.day-btn');
const daysGrid = document.getElementById('daysGrid');
const dayPlanner = document.getElementById('dayPlanner');
const dayTitle = document.getElementById('dayTitle');
const backToDays = document.getElementById('backToDays');

dayButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedDay = btn.dataset.day;
    dayTitle.textContent = selectedDay;

    // Hide main background and grid
    readingSection.classList.add('hide-bg');
    daysGrid.style.display = 'none';

    // Show day planner
    dayPlanner.classList.remove('hidden');
  });
});

backToDays.addEventListener('click', () => {
  // Show main background and grid
  readingSection.classList.remove('hide-bg');
  daysGrid.style.display = 'flex';
  
  // Hide day planner
  dayPlanner.classList.add('hidden');
});
