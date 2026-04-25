const ctx = document.getElementById("puzzleChart");

const chartData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Solved Puzzles",
      data: [2, 3, 1, 4, 2, 5, 1],
      backgroundColor: "rgba(124, 58, 237, 0.72)",
      borderColor: "#a78bfa",
      borderWidth: 1.2,
      borderRadius: 10,
      hoverBackgroundColor: "rgba(139, 92, 246, 0.9)"
    }
  ]
};

const puzzleChart = new Chart(ctx, {
  type: "bar",
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 500
    },
    plugins: {
      legend: {
        labels: {
          color: "#dbe2f1",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#d1d5db",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#94a3b8"
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          stepSize: 1
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false
        }
      }
    }
  }
});

const eventMessages = [
  "User solved a debugging puzzle and unlocked a short session.",
  "A successful task completion raised the current focus profile.",
  "The system logged another earned access session.",
  "A technical challenge was completed instead of passive scrolling.",
  "Recent interaction shows improved effort before access was granted."
];

function bumpMetric(metricId, cardId) {
  const metric = document.getElementById(metricId);
  const card = document.getElementById(cardId);

  metric.classList.remove("bump");
  card.classList.remove("flash");

  void metric.offsetWidth;
  void card.offsetWidth;

  metric.classList.add("bump");
  card.classList.add("flash");
}

document.getElementById("updateBtn").addEventListener("click", () => {
  let hours = parseFloat(document.getElementById("hours").textContent);
  let focus = parseInt(document.getElementById("focus").textContent);
  let puzzles = parseInt(document.getElementById("puzzles").textContent);
  let unlocks = parseInt(document.getElementById("unlocks").textContent);

const hourIncrease = Number((Math.random() * 0.9 + 0.1).toFixed(1));
const focusChange = Math.floor(Math.random() * 2); // 0 or 1
const puzzleIncrease = Math.floor(Math.random() * 2) + 1; // 1 or 2
const unlockIncrease = Math.floor(Math.random() * 2); // 0 or 1

  hours += hourIncrease;
  focus = Math.min(Math.max(focus + focusChange, 0), 100);
  puzzles += puzzleIncrease;
  unlocks += unlockIncrease;

  document.getElementById("hours").textContent = hours.toFixed(1);
  document.getElementById("focus").textContent = focus + "%";
  document.getElementById("puzzles").textContent = puzzles;
  document.getElementById("unlocks").textContent = unlocks;

  bumpMetric("hours", "hoursCard");
  bumpMetric("focus", "focusCard");
  bumpMetric("puzzles", "puzzlesCard");
  bumpMetric("unlocks", "unlocksCard");

  puzzleChart.data.datasets[0].data = puzzleChart.data.datasets[0].data.map((value) => {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    return Math.max(value + change, 0);
  });

  puzzleChart.update();

  const randomEvent = eventMessages[Math.floor(Math.random() * eventMessages.length)];
  document.getElementById("eventLog").textContent = randomEvent;

  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  document.getElementById("lastUpdated").textContent = "Last updated: " + now;
});