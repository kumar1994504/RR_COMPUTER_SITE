/**
 * RR Computers - Premium Voice Assistant & Audio Engine
 * Govt Authorized e-Seva & CSC Portal
 * Features:
 *  - Studio-Quality Natural Neural Audio (welcome-ta.mp3 & welcome-en.mp3)
 *  - Web Speech API fallback with proper onvoiceschanged & voice detection
 *  - Never feeds Tamil Unicode to English TTS (prevents distorted gibberish)
 *  - Collision-Free Header Actions Container (.top-actions)
 */
!function () {
  "use strict";

  var STORAGE_KEY = "matisha-voice-enabled";
  var isMuted = localStorage.getItem(STORAGE_KEY) === "muted";
  var hasSpokenWelcome = false;
  var currentAudio = null;
  var synth = window.speechSynthesis || null;
  var availableVoices = [];

  function isTamil() {
    return document.documentElement.getAttribute("data-lang") === "ta";
  }

  // Pre-recorded High-Definition Neural Voice Assets
  var AUDIO_ASSETS = {
    ta: "assets/welcome-ta.mp3",
    en: "assets/welcome-en.mp3"
  };

  // Pre-configured text for Web Speech API fallback
  var WELCOME_TEXTS = {
    ta: "வணக்கம்! தளவாய், அரியலூர் மாவட்டத்தில் உள்ள RR Computers அரசு அங்கீகரிக்கப்பட்ட இ-சேவை மற்றும் பொதுச் சேவை மையத்திற்கு அன்புடன் வரவேற்கிறோம். பட்டா, சிட்டா, அரசு சான்றிதழ்கள், மற்றும் டிஜிட்டல் கையொப்ப சரிபார்ப்பு சேவைகளுக்கு நாங்கள் உதவுகிறோம்.",
    en: "Welcome to RR Computers, Government Authorized e-Seva and CSC Center, Thalavai, Ariyalur District. Land records, certificate applications, and digital signature verification made simple."
  };

  // Cache available voices asynchronously
  function loadVoices() {
    if (!synth) return;
    try {
      availableVoices = synth.getVoices() || [];
    } catch (e) {
      availableVoices = [];
    }
  }

  if (synth) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  // Check if device actually has a native Tamil voice
  function hasTamilVoice() {
    if (!availableVoices.length && synth) loadVoices();
    for (var i = 0; i < availableVoices.length; i++) {
      var v = availableVoices[i];
      if (/^ta\b|ta[-_]IN|tamil/i.test(v.lang || "") || /tamil/i.test(v.name || "")) {
        return v;
      }
    }
    return null;
  }

  function getEnglishVoice() {
    if (!availableVoices.length && synth) loadVoices();
    for (var i = 0; i < availableVoices.length; i++) {
      var v = availableVoices[i];
      if (/en[-_]IN|indian/i.test(v.lang || "") || /india/i.test(v.name || "")) {
        return v;
      }
    }
    for (var j = 0; j < availableVoices.length; j++) {
      var v2 = availableVoices[j];
      if (/^en\b/i.test(v2.lang || "")) {
        return v2;
      }
    }
    return null;
  }

  // Main Speak Function
  function playWelcome() {
    if (isMuted) return;

    // Stop ongoing playback
    stopAll();

    var lang = isTamil() ? "ta" : "en";
    var audioUrl = AUDIO_ASSETS[lang];

    // Priority 1: High Quality Natural Neural Audio File
    if (audioUrl) {
      try {
        var audio = new Audio(audioUrl);
        currentAudio = audio;
        updateVoiceBtnUI(true);

        audio.play().then(function () {
          // Playing successfully
        }).catch(function (err) {
          // If browser restricts autoplay or audio file fails, fallback to speech synth
          console.warn("Audio file play prevented, trying SpeechSynthesis fallback:", err);
          speakViaSynth(lang);
        });

        audio.onended = function () {
          currentAudio = null;
          updateVoiceBtnUI(false);
        };
        audio.onerror = function () {
          currentAudio = null;
          speakViaSynth(lang);
        };
        return;
      } catch (e) {
        console.warn("Audio element failed, falling back to Web Speech:", e);
      }
    }

    // Priority 2: Web Speech API (with safety check against garbled Tamil)
    speakViaSynth(lang);
  }

  function speakViaSynth(lang) {
    if (!synth || isMuted) return;

    // CRITICAL FIX: If Tamil is selected, NEVER pass Tamil Unicode to an English voice engine!
    // Passing Tamil Unicode to an English voice produces garbled gibberish ("கண்ணாப்புன்னா").
    if (lang === "ta") {
      var taVoice = hasTamilVoice();
      if (!taVoice) {
        console.info("No Tamil TTS voice on this device. Using English introduction with Tamil greeting.");
        // Speak clear English introduction that mentions RR Computers e-Seva
        var fallbackUtter = new SpeechSynthesisUtterance("Vanakkam! Welcome to RR Computers, Government Authorized e-Seva and CSC Center, Thalavai, Ariyalur District. All online services, patta chitta, and certificates.");
        fallbackUtter.lang = "en-IN";
        var engV = getEnglishVoice();
        if (engV) fallbackUtter.voice = engV;
        fallbackUtter.rate = 0.95;
        fallbackUtter.onstart = function () { updateVoiceBtnUI(true); };
        fallbackUtter.onend = function () { updateVoiceBtnUI(false); };
        fallbackUtter.onerror = function () { updateVoiceBtnUI(false); };
        synth.speak(fallbackUtter);
        return;
      }

      // If genuine Tamil voice exists
      var utterTa = new SpeechSynthesisUtterance(WELCOME_TEXTS.ta);
      utterTa.lang = "ta-IN";
      utterTa.voice = taVoice;
      utterTa.rate = 0.92;
      utterTa.onstart = function () { updateVoiceBtnUI(true); };
      utterTa.onend = function () { updateVoiceBtnUI(false); };
      utterTa.onerror = function () { updateVoiceBtnUI(false); };
      synth.speak(utterTa);
      return;
    }

    // Standard English Speech
    var utterEn = new SpeechSynthesisUtterance(WELCOME_TEXTS.en);
    utterEn.lang = "en-IN";
    var matchEn = getEnglishVoice();
    if (matchEn) utterEn.voice = matchEn;
    utterEn.rate = 1.0;
    utterEn.onstart = function () { updateVoiceBtnUI(true); };
    utterEn.onend = function () { updateVoiceBtnUI(false); };
    utterEn.onerror = function () { updateVoiceBtnUI(false); };
    synth.speak(utterEn);
  }

  function stopAll() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
    }
    if (synth && synth.speaking) {
      synth.cancel();
    }
    updateVoiceBtnUI(false);
  }

  function isCurrentlyPlaying() {
    return (currentAudio && !currentAudio.paused) || (synth && synth.speaking);
  }

  function triggerWelcome() {
    if (hasSpokenWelcome || isMuted) return;
    hasSpokenWelcome = true;
    playWelcome();
  }

  // Set up Header Action Container & Voice Toggle Button
  function setupVoiceUI() {
    var langDiv = document.querySelector(".lang");
    if (!langDiv) return;

    var header = langDiv.closest("header.top") || langDiv.parentNode;

    // Check or create .top-actions wrapper
    var actionsWrap = header.querySelector(".top-actions");
    if (!actionsWrap) {
      actionsWrap = document.createElement("div");
      actionsWrap.className = "top-actions";
      langDiv.parentNode.insertBefore(actionsWrap, langDiv);
      actionsWrap.appendChild(langDiv);
    }

    // Avoid duplicate buttons
    var existingBtn = document.getElementById("voice-btn");
    if (existingBtn) existingBtn.remove();

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "voice-toggle-btn" + (isMuted ? " muted" : "");
    btn.id = "voice-btn";
    btn.setAttribute("aria-label", "குரல் உதவி / Voice Assistance");
    btn.title = isTamil() ? "குரல் உதவி (அழுத்துங்கள்)" : "Voice Assistant (Click to listen)";
    btn.innerHTML = (isMuted ? "🔇" : "🔊") + ' <span class="vb-txt">' + (isTamil() ? "குரல்" : "Voice") + '</span>';

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (isCurrentlyPlaying()) {
        stopAll();
        return;
      }
      if (isMuted) {
        isMuted = false;
        localStorage.setItem(STORAGE_KEY, "active");
        btn.classList.remove("muted");
        btn.innerHTML = '🔊 <span class="vb-txt">' + (isTamil() ? "குரல்" : "Voice") + '</span>';
        playWelcome();
      } else {
        playWelcome();
      }
    });

    // Insert inside .top-actions before .lang
    actionsWrap.insertBefore(btn, langDiv);
  }

  function updateVoiceBtnUI(isPlaying) {
    var btn = document.getElementById("voice-btn");
    if (!btn) return;
    if (isPlaying) {
      btn.classList.add("speaking");
      btn.innerHTML = '📢 <span class="vb-txt">' + (isTamil() ? "பேசுகிறது…" : "Playing…") + '</span>';
    } else {
      btn.classList.remove("speaking");
      btn.innerHTML = (isMuted ? "🔇" : "🔊") + ' <span class="vb-txt">' + (isTamil() ? "குரல்" : "Voice") + '</span>';
    }
  }

  // Sync button text on language switch
  document.addEventListener("langchange", function () {
    var btn = document.getElementById("voice-btn");
    if (btn && !isCurrentlyPlaying()) {
      btn.innerHTML = (isMuted ? "🔇" : "🔊") + ' <span class="vb-txt">' + (isTamil() ? "குரல்" : "Voice") + '</span>';
      btn.title = isTamil() ? "குரல் உதவி (அழுத்துங்கள்)" : "Voice Assistant (Click to listen)";
    }
    // If playing while switching languages, play new language audio
    if (isCurrentlyPlaying()) {
      playWelcome();
    }
  });

  // Browser Autoplay Policy handling: First user interaction triggers voice if unmuted
  function handleFirstInteraction() {
    if (!hasSpokenWelcome && !isMuted) {
      triggerWelcome();
    }
    window.removeEventListener("click", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
    window.removeEventListener("touchstart", handleFirstInteraction);
  }

  window.addEventListener("click", handleFirstInteraction, { once: true });
  window.addEventListener("keydown", handleFirstInteraction, { once: true });
  window.addEventListener("touchstart", handleFirstInteraction, { once: true });

  // Expose global controller
  window.MatishaVoice = {
    play: playWelcome,
    stop: stopAll,
    welcome: triggerWelcome,
    toggleMute: function () {
      isMuted = !isMuted;
      localStorage.setItem(STORAGE_KEY, isMuted ? "muted" : "active");
      updateVoiceBtnUI(false);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupVoiceUI);
  } else {
    setupVoiceUI();
  }
}();
