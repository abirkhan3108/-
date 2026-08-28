/* =====================================================
   স্মৃতি সংরক্ষণ — Public App
   Admin Dashboard সম্পূর্ণ Public App থেকে সরানো হয়েছে
===================================================== */

const supabaseLoaded = !!window.supabase;

const validConfig = !!(
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  window.SUPABASE_URL.includes("supabase.co") &&
  !window.SUPABASE_URL.includes("YOUR-") &&
  !window.SUPABASE_URL.includes("PASTE_")
);

const sb =
  supabaseLoaded && validConfig
    ? window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
      )
    : null;


/* =====================================================
   Helper
===================================================== */

const $ = (id) => document.getElementById(id);


const searchInput = $("searchInput");
const searchBtn = $("searchBtn");
const results = $("results");

const totalProfiles = $("totalProfiles");
const monthlyProfiles = $("monthlyProfiles");

const lastSearch = $("lastSearch");
const lastSearchTime = $("lastSearchTime");

const historyBtn = $("historyBtn");
const infoBtn = $("infoBtn");
const homeBtn = $("homeBtn");

const menuBtn = $("menuBtn");
const toast = $("toast");


/* =====================================================
   Escape HTML
===================================================== */

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );
}


/* =====================================================
   Toast
===================================================== */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =====================================================
   Local Search History
===================================================== */

function getSearchHistory() {
  try {
    return JSON.parse(
      localStorage.getItem("smritiSearchHistory") || "[]"
    );
  } catch {
    return [];
  }
}


function saveSearchHistory(name, count) {
  const history = getSearchHistory();

  history.unshift({
    name,
    count,
    time: new Date().toISOString()
  });

  localStorage.setItem(
    "smritiSearchHistory",
    JSON.stringify(history.slice(0, 30))
  );
}


/* =====================================================
   Last Search
===================================================== */

function updateLastSearch(name, count) {

  if (!lastSearch) return;

  if (!name) {
    lastSearch.textContent = "—";

    if (lastSearchTime) {
      lastSearchTime.textContent =
        "এখনও কোনো সার্চ নেই";
    }

    return;
  }

  lastSearch.textContent = name;

  if (lastSearchTime) {

    if (count === 0) {
      lastSearchTime.textContent =
        "কোনো Profile পাওয়া যায়নি";
    } else {
      lastSearchTime.textContent =
        `${count} টি Profile পাওয়া গেছে`;
    }

  }
}


/* =====================================================
   Load Dashboard Statistics
===================================================== */

async function loadStats() {

  if (!sb) {

    if (totalProfiles) {
      totalProfiles.textContent = "0";
    }

    if (monthlyProfiles) {
      monthlyProfiles.textContent = "0";
    }

    return;
  }

  try {

    const { data, error } = await sb
      .from("profiles")
      .select("id, created_at");

    if (error) throw error;

    const rows = data || [];

    if (totalProfiles) {
      totalProfiles.textContent = rows.length;
    }


    const now = new Date();

    const monthly = rows.filter((row) => {

      if (!row.created_at) {
        return false;
      }

      const date = new Date(row.created_at);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );

    }).length;


    if (monthlyProfiles) {
      monthlyProfiles.textContent = monthly;
    }

  } catch (error) {

    console.error(
      "Statistics error:",
      error
    );

  }
}


/* =====================================================
   Search Profiles
===================================================== */

async function searchProfiles(name) {

  const queryText = String(name || "").trim();

  if (!queryText) {

    showToast("নাম লিখে সার্চ করুন");

    if (results) {
      results.classList.add("hidden");
      results.innerHTML = "";
    }

    return;
  }


  if (results) {

    results.classList.remove("hidden");

    results.innerHTML = `
      <div class="search-card">
        <p>🔎 Profile খোঁজা হচ্ছে...</p>
      </div>
    `;

  }


  try {

    let rows = [];


    /* -----------------------------
       Supabase
    ----------------------------- */

    if (sb) {

      const { data, error } = await sb
        .from("profiles")
        .select("*")
        .ilike("name", `%${queryText}%`)
        .order("created_at", {
          ascending: false
        });

      if (error) throw error;

      rows = data || [];

    }


    /* -----------------------------
       Demo / Offline
    ----------------------------- */

    else {

      const stored = JSON.parse(
        localStorage.getItem("demoProfiles") || "[]"
      );

      rows = stored.filter((profile) =>
        String(profile.name || "")
          .toLowerCase()
          .includes(queryText.toLowerCase())
      );

    }


    updateLastSearch(
      queryText,
      rows.length
    );

    saveSearchHistory(
      queryText,
      rows.length
    );


    renderResults(rows);


  } catch (error) {

    console.error(
      "Search error:",
      error
    );

    if (results) {

      results.classList.remove("hidden");

      results.innerHTML = `
        <div class="search-card">
          <p class="error">
            ❌ সার্চ করা যায়নি
          </p>
        </div>
      `;

    }

  }

}


/* =====================================================
   Render Results
===================================================== */

function renderResults(rows) {

  if (!results) return;


  if (!rows.length) {

    results.classList.remove("hidden");

    results.innerHTML = `
      <div class="search-card">
        <div class="search-icon">🔎</div>

        <h3>কোনো Profile পাওয়া যায়নি</h3>

        <p>
          অন্য নাম দিয়ে আবার চেষ্টা করুন।
        </p>
      </div>
    `;

    return;
  }


  results.classList.remove("hidden");


  results.innerHTML = rows.map((profile) => {

    const name =
      escapeHTML(profile.name || "নাম নেই");

    const father =
      escapeHTML(profile.father || "");

    const village =
      escapeHTML(profile.village || "");

    const age =
      profile.age !== null &&
      profile.age !== undefined &&
      profile.age !== ""
        ? escapeHTML(profile.age)
        : "";

    const reason =
      escapeHTML(
        profile.death_reason ||
        profile.reason ||
        ""
      );


    const date =
      escapeHTML(
        profile.date ||
        profile.death_date ||
        ""
      );


    const photo =
      profile.photo_url
        ? `
          <img
            src="${escapeHTML(profile.photo_url)}"
            alt="${name}"
            class="profile-photo"
          >
        `
        : `
          <div class="profile-photo-placeholder">
            👤
          </div>
        `;


    return `

      <article class="profile-card">

        <div class="profile-card-top">

          ${photo}

          <div class="profile-main">

            <h3>${name}</h3>

            ${
              father
                ? `<p>👤 ${father}</p>`
                : ""
            }

            ${
              village
                ? `<p>📍 ${village}</p>`
                : ""
            }

          </div>

        </div>


        <div class="profile-details">

          ${
            age
              ? `
                <div>
                  <small>বয়স</small>
                  <strong>${age} বছর</strong>
                </div>
              `
              : ""
          }


          ${
            date
              ? `
                <div>
                  <small>তারিখ</small>
                  <strong>${date}</strong>
                </div>
              `
              : ""
          }


          ${
            reason
              ? `
                <div>
                  <small>মৃত্যুর কারণ</small>
                  <strong>${reason}</strong>
                </div>
              `
              : ""
          }

        </div>

      </article>

    `;

  }).join("");

}


/* =====================================================
   Search Button
===================================================== */

if (searchBtn) {

  searchBtn.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      searchProfiles(
        searchInput?.value || ""
      );

    }
  );

}


/* =====================================================
   Enter Search
===================================================== */

if (searchInput) {

  searchInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        searchProfiles(
          searchInput.value
        );

      }

    }
  );

}


/* =====================================================
   Search History
===================================================== */

if (historyBtn) {

  historyBtn.addEventListener(
    "click",
    () => {

      const history =
        getSearchHistory();


      if (!history.length) {

        showToast(
          "এখনও কোনো সার্চ হিস্টরি নেই"
        );

        return;

      }


      if (!results) return;


      results.classList.remove(
        "hidden"
      );


      results.innerHTML = `

        <div class="search-card">

          <h3>◷ সার্চ হিস্টরি</h3>

          <div class="history-list">

            ${history.map((item) => `

              <button
                type="button"
                class="history-item"
                data-history-name="${escapeHTML(item.name)}"
              >

                <strong>
                  ${escapeHTML(item.name)}
                </strong>

                <small>
                  ${item.count} টি ফলাফল
                </small>

              </button>

            `).join("")}

          </div>

        </div>

      `;


      document
        .querySelectorAll(".history-item")
        .forEach((button) => {

          button.addEventListener(
            "click",
            () => {

              const name =
                button.dataset.historyName;

              if (searchInput) {
                searchInput.value = name;
              }

              searchProfiles(name);

            }
          );

        });

    }
  );

}


/* =====================================================
   Info
===================================================== */

if (infoBtn) {

  infoBtn.addEventListener(
    "click",
    () => {

      if (!results) return;

      results.classList.remove(
        "hidden"
      );

      results.innerHTML = `

        <div class="search-card">

          <div class="search-icon">
            ℹ️
          </div>

          <h2>স্মৃতি সংরক্ষণ</h2>

          <p>
            প্রিয়জনের স্মৃতি, ছবি ও
            গুরুত্বপূর্ণ তথ্য সংরক্ষণ ও
            নাম দিয়ে খুঁজে দেখার জন্য
            এই অ্যাপ তৈরি করা হয়েছে।
          </p>

        </div>

      `;

    }
  );

}


/* =====================================================
   Home
===================================================== */

if (homeBtn) {

  homeBtn.addEventListener(
    "click",
    () => {

      if (results) {

        results.classList.add(
          "hidden"
        );

        results.innerHTML = "";

      }

      if (searchInput) {
        searchInput.focus();
      }

    }
  );

}


/* =====================================================
   Menu
===================================================== */

if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      showToast(
        "স্মৃতি সংরক্ষণ"
      );

    }
  );

}


/* =====================================================
   Start App
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadStats();

  }
);


/* =====================================================
   IMPORTANT
   এখানে কোনো Admin Dashboard code নেই।
===================================================== */
