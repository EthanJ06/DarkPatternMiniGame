const level1 = {
  id: "l1",
  title: "Level 1",
  isAI: false,
  goal: "Cancel your subscription",
  hints: [
    "There's a button to cancel — but it's not the primary action on each screen.",
    "Click every button that mentions 'cancel' or 'no'. Ignore offers and surveys as best you can.",
  ],
  pattern: "Roach Motel",
  brief: "The Roach Motel is named after the ad slogan: 'You can check in, but you can't check out.' Signing up is effortless — one or two clicks. Cancelling is a maze of detours, fake offers, and exhausting surveys. The goal is to wear you down until you give up.",
  goalDetail: "You have a NebulaPro subscription. You want to cancel it. Click 'Cancel subscription' and follow the steps all the way through.",
  dollars: {
    label: "If you gave up and kept the plan",
    amount: 9.99,
    period: "month",
    note: "A recurring charge for a service you actively tried to cancel.",
  },
  rw: {
    company: "The New York Times",
    detail: "Sign-up takes a few clicks, but cancelling requires chatting with a \"Customer Care Advocate\" during limited hours or calling in — no online cancel button. A 2020 class-action suit and years of public complaints called it \"exceedingly difficult.\"",
    link: "https://www.deceptive.design/brands/new-york-times",
  },
  replay: [
    { trap: false, note: "Sign-up is reduced to one or two clicks — deliberately asymmetric with how cancellation is designed." },
    { trap: true,  note: "A \"pause\" or \"downgrade\" option is surfaced as a friendly alternative before the actual cancel path is reachable, breaking your momentum." },
    { trap: true,  note: "A mandatory feedback survey delays the cancellation and doubles as data collection for retention scripts." },
    { trap: true,  note: "A discount or \"special offer\" only appears once you've committed to leaving — a last-ditch retention loop." },
    { trap: true,  note: "Cancellation requires phone or live chat during limited hours instead of a same-page button, adding wait time as friction." },
    { trap: false, note: "A vague confirmation (\"allow 5–7 business days\") creates doubt about whether it actually worked, prompting some people to re-subscribe just in case." },
  ],

  render(el) {
    let step = 0;

    // Take over the whole fake-app surface so this reads as a real account
    // settings page (sidebar + topbar) rather than a floating modal card.
    el.innerHTML = "";
    el.style.padding = "0";
    el.style.gap = "0";
    el.style.margin = "0";
    el.style.flex = "1";
    el.style.overflow = "hidden";
    el.style.borderRadius = "0";
    el.style.background = "var(--white)";

    const navItem = (label, emoji, active) => `
      <div class="l1-nav-item${active ? ' active' : ''}" style="
        display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:7px;
        font-size:13px; color:${active ? '#111' : '#777'}; font-weight:${active ? '600' : '400'};
        background:${active ? '#efefe9' : 'transparent'}; cursor:default; white-space:nowrap;
      ">
        <span style="flex-shrink:0">${emoji}</span>
        <span class="l1-nav-label">${label}</span>
      </div>`;

    el.insertAdjacentHTML("beforeend", `
      <style>
        @media (max-width:560px) {
          .l1-sidebar   { width:52px !important; padding-left:6px !important; padding-right:6px !important; }
          .l1-nav-label { display:none !important; }
          .l1-brand     { display:none !important; }
        }
        #l1-content .sub-header  { margin-bottom: 20px; }
        #l1-content .plan-card,
        #l1-content .offer-card,
        #l1-content .reason-card { margin-top: 18px; }
        #l1-content .step-dots   { margin-bottom: 22px; }
        #l1-content .step-dots > div:first-child { flex: 1; }
        #l1-content .step-dot    { flex: 1; }
        #l1-content .btn-row     { gap: 12px; margin-top: 24px !important; }
        #l1-content .btn {
          padding: 12px 22px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 500;
          border: 1.5px solid var(--fa-input-border);
          transition: background .15s ease, border-color .15s ease, transform .1s ease;
        }
        #l1-content .btn:hover  { background: #f3f3f0; border-color: #b8b8b0; }
        #l1-content .btn:active { transform: scale(.98); }
        #l1-content .btn-p {
          background: #111; color: #fff; border-color: transparent;
          box-shadow: 0 1px 2px rgba(0,0,0,.15);
        }
        #l1-content .btn-p:hover { background: #000; border-color: transparent; }
      </style>
      <div style="display:flex; height:100%; min-height:0;">
        <div class="l1-sidebar" style="
          width:176px; flex-shrink:0; background:#faf9f7; border-right:1px solid var(--fa-line2);
          padding:18px 10px; display:flex; flex-direction:column; gap:2px; overflow-y:auto;
        ">
          <div class="l1-brand" style="font-size:13px; font-weight:700; color:#111; letter-spacing:-.01em; padding:0 10px 14px;">NebulaPro</div>
          ${navItem('Profile', '👤', false)}
          ${navItem('Subscription', '💳', true)}
          ${navItem('Payment methods', '🧾', false)}
          ${navItem('Notifications', '🔔', false)}
          ${navItem('Privacy', '🛡️', false)}
          ${navItem('Security', '🔒', false)}
        </div>
        <div style="flex:1; min-width:0; display:flex; flex-direction:column; min-height:0;">
          <div style="
            display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
            padding:14px clamp(14px,3vw,22px); border-bottom:1px solid var(--fa-line2);
          ">
            <div style="font-size:12px; color:#999;">Account &rsaquo; <span style="color:#333; font-weight:500">Subscription</span></div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:26px; height:26px; border-radius:50%; background:#e4e4e0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#666; flex-shrink:0;">JE</div>
              <span style="font-size:12px; color:#555; white-space:nowrap;">My Account</span>
            </div>
          </div>
          <div id="l1-content" style="flex:1; min-height:0; overflow-y:auto; padding:clamp(20px,4vw,32px);">
          <div id="l1-card" style="
            width:min(900px,100%);
            display:flex;
            flex-direction:column;
            min-height:100%;
          "></div>
          </div>
        </div>
      </div>`);

    const card = document.getElementById("l1-card");

    const stepDots = (n) => `
      <div class="step-dots" style="width:100%; justify-content:space-between;">
        <div style="display:flex; gap:5px; align-items:center;">
          ${Array.from({ length: 6 }).map((_, i) => `<div class="step-dot${i < n ? ' done' : ''}${i === n ? ' cur' : ''}"></div>`).join('')}
        </div>
        <span class="ftiny">Step ${n + 1} of 6</span>
      </div>`;

    const cardIcon = (paths) => `
      <div class="sub-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
      </div>`;

    const steps = [
      () => card.innerHTML = `
        ${stepDots(0)}
        <div class="sub-header">
          ${cardIcon('<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>')}
          <div>
            <div class="sub-title">Manage subscription</div>
            <div class="sub-sub">NebulaPro account settings</div>
          </div>
        </div>
        <div class="plan-card">
          <div>
            <div class="plan-name">NebulaPro Premium</div>
            <div class="plan-meta">Renews the first of every month&middot; $9.99/month</div>
          </div>
          <div class="status-pill">Active</div>
        </div>
        <div class="btn-row">
          <button class="btn" id="l1-cancel">Cancel subscription</button>
          <button class="btn btn-p" onclick="G.fail('That keep-plan button is placed to interrupt you before you even reach the real cancel flow.');if(G.getLevelAttempts()>=2){const b=document.getElementById('l1-cancel');if(b)b.style.cssText+='outline:3px solid #27500A;background:#EAF3DE;color:#27500A'}">Keep plan</button>
        </div>`,

      () => card.innerHTML = `
        ${stepDots(1)}
        <div class="sub-header">
          ${cardIcon('<path d="M10 8v8M14 8v8"/><rect x="4" y="3" width="16" height="18" rx="2"/>')}
          <div>
            <div class="sub-title">Before you go...</div>
            <div class="sub-sub">We'd hate to see you leave</div>
          </div>
        </div>
        <div class="offer-card">
          <span class="offer-badge">Alternative</span>
          <div style="font-size:13.5px;font-weight:600;color:#111">Pause your plan instead</div>
          <div class="fs" style="margin-top:3px">No charges for up to 3 months. Resume any time — your settings and history are kept exactly as they are.</div>
        </div>
        <div class="btn-row">
          <button class="btn" id="l1-no">No, cancel</button>
          <button class="btn btn-p" onclick="G.fail('Pausing is not cancelling — the charges keep going while it looks like you handled it.');if(G.getLevelAttempts()>=2){const b=document.getElementById('l1-no');if(b)b.style.cssText+='outline:3px solid #27500A;background:#EAF3DE;color:#27500A'}">Pause for free</button>
        </div>`,

      () => card.innerHTML = `
        ${stepDots(2)}
        <div class="sub-header">
          ${cardIcon('<path d="M12 19l-7-7 7-7M5 12h14"/>')}
          <div>
            <div class="sub-title">Why are you leaving?</div>
            <div class="sub-sub">Select all that apply to continue</div>
          </div>
        </div>
        <div class="reason-card">
          ${['Too expensive', 'Not using it', 'Missing features', 'Found a better option', 'Other']
          .map(o => `<label class="reason-row"><input type="checkbox" name="l1w"> ${o}</label>`).join('')}
        </div>
        <div class="btn-row">
          <button class="btn" id="l1-survey">Continue</button>
        </div>`,

      () => card.innerHTML = `
        ${stepDots(3)}
        <div class="sub-header">
          ${cardIcon('<path d="M12 2l2.4 6.6L21 10l-5.5 4.3L17 21l-5-3.5L7 21l1.5-6.7L3 10l6.6-1.4z"/>')}
          <div>
            <div class="sub-title">Special offer &mdash; just for you</div>
            <div class="sub-sub">Available only if you stay subscribed now</div>
          </div>
        </div>
        <div class="offer-card">
          <span class="offer-badge">50% off · 3 months</span>
          <div>
            <span class="price-strike">$9.99/mo</span><span class="price-now">$4.99/mo</span>
          </div>
          <div class="price-save">You save $15 over the next 3 months</div>
        </div>
        <div class="btn-row">
          <button class="btn" id="l1-offer">No thanks, cancel</button>
          <button class="btn btn-p" onclick="G.fail('Taking the discount keeps you subscribed — that is exactly what a retention offer is built to do.');if(G.getLevelAttempts()>=2){const b=document.getElementById('l1-offer');if(b)b.style.cssText+='outline:3px solid #27500A;background:#EAF3DE;color:#27500A'}">Accept offer</button>
        </div>`,

      () => card.innerHTML = `
        ${stepDots(4)}
        <div class="sub-header">
          ${cardIcon('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"/>')}
          <div>
            <div class="sub-title">Help us improve</div>
            <div class="sub-sub">Required to finish cancelling</div>
          </div>
        </div>
        <div class="reason-card" style="padding:10px 12px">
          ${['How satisfied were you?', 'How easy was it to use?', 'Likelihood to return?', 'Would you recommend us?', 'Did you use mobile?', 'How did you find us?']
          .map((q, i) => `
              <div style="padding:10px 0;${i < 5 ? 'border-bottom:1px solid #f0f0ee' : ''}">
                <div class="fs" style="color:#333">${i + 1}. ${q}</div>
                <div class="star-row" style="display:flex;gap:6px;margin-top:6px">
                  ${"12345".split("").map((_, si) => `<span class="star" data-i="${si}" style="font-size:18px;cursor:pointer">★</span>`).join("")}
                </div>
              </div>`).join('')}
        </div>
        <div class="btn-row">
          <button class="btn" id="l1-done">Submit & cancel</button>
        </div>`,

      () => card.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; height:100%; min-height:500px; gap:10px;">
          <div class="confirm-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f7a44" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          </div>
        <div style="font-size:14px;font-weight:600;color:#111">Request received</div>
        <div class="fs" style="max-width:280px">
          Allow 5–7 business days.<br>
          Subscription stays active until then.
        </div>
        <button class="btn btn-p" onclick="G.succeed()">Done</button>
      </div>`,
    ];

    const bind = () => {
      const ids = ["l1-cancel", "l1-no", "l1-offer"];
      ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = advance;
      });

      const surveyBtn = document.getElementById("l1-survey");
      if (surveyBtn) surveyBtn.onclick = () => {
        const selected = document.querySelector("input[name=\"l1w\"]:checked");
        if (!selected) {
          almostGotYou(el, "You must select at least one reason before continuing.");
          return;
        }
        advance();
      };

      const doneBtn = document.getElementById("l1-done");
      if (doneBtn) doneBtn.onclick = () => {
        const allRated = Array.from(document.querySelectorAll(".star-row")).every(row =>
          row.querySelector(".star.selected")
        );
        if (!allRated) {
          almostGotYou(el, "You must answer all questions before submitting.");
          return;
        }
        advance();
      };

      document.querySelectorAll(".star").forEach(star => {
        star.onclick = () => {
          const row = star.closest(".star-row");
          row.querySelectorAll(".star").forEach((s, i) => {
            s.classList.toggle("selected", i <= parseInt(star.dataset.i));
          });
        };
      });
    };

    const advance = () => { step++; steps[step](); bind(); };
    steps[0]();
    bind();
  },
};

export default level1;