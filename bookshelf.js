
'use strict';

(() => {
  // Portfolio stories reflect the project descriptions already presented on the site.
  const books = [
    {
      id: 'nasa', title: 'NASA Robotic-Arm Assessment', edition: 'NASA Marshall · OSTEM internship · 2026',
      subtitle: 'Independent lunar-dust robotic-arm feasibility and verification planning',
      story: 'During my NASA Marshall OSTEM internship, I independently evaluated a robotic arm for proposed lunar-dust mitigation testing in a high-vacuum context, with NASA technical mentor oversight. This is a personal portfolio summary, not an official NASA report.',
      challenge: 'Assess reachability, loading, actuator and environmental constraints before choosing a test-ready robotic-arm configuration.',
      approach: 'Examine arm geometry, joint travel and workspace; estimate shoulder load; derive hierarchical requirements from operating scenarios; prepare preliminary control and atmospheric bench-test procedures.',
      tools: 'Creo, Python, Pololu Micro Maestro 6, ROS 2, MuJoCo, structured system requirements and verification planning.',
      outcome: 'Developed 34 requirements from six scenarios. The preliminary 3.1 N·m shoulder estimate excludes rocker and actuator masses; actuator selection and vacuum qualification remain unverified.',
      link: 'projects/nasa.html', action: 'Read the project and NASA disclaimer'
    },
    {
      id: 'ur3e', title: 'UR3e Robot Kinematics', edition: 'ME422 · Spring 2026 · Group study',
      subtitle: 'Modeling six degrees of freedom with Jacobians',
      story: 'In a three-person robotics analysis project, our team studied the Universal Robots UR3e, a six-joint collaborative arm. We assigned Denavit–Hartenberg frames and derived the transformations that describe how each joint contributes to the end-effector pose. The project connected the mathematics of robot motion to an industrial manipulator.',
      challenge: 'Represent the pose and end-effector velocity of a six-revolute-joint robot and identify singular configurations.',
      approach: 'Develop a six-link DH table, multiply homogeneous transformations, derive the Jacobian, and evaluate its rank with MATLAB. The analyzed zero-angle configuration produced rank 5, indicating a singularity.',
      tools: 'MATLAB, Denavit–Hartenberg convention, forward kinematics, Jacobians, velocity analysis.',
      outcome: 'A group analysis of end-effector motion and singularity, with another evaluated configuration reaching full Jacobian rank.',
      link: 'projects/ur3e.html', action: 'Read the complete project page'
    },
    {
      id: 'leg', title: '3-Link Leg Simulation', edition: 'GitHub · Robotics & controls',
      subtitle: 'Exploring how connected joints move together',
      story: 'I modeled the hip, knee, and ankle as a connected three-link human leg. The model translates joint motion into foot position and velocity while examining the torques involved in linked-body motion.',
      challenge: 'Calculate the position, velocity, and dynamic response of a three-joint biomechanical system.',
      approach: 'Use a MATLAB S-function within Simulink, Jacobian kinematics, and Newton–Euler dynamics to compute joint torques.',
      tools: 'MATLAB, Simulink, S-functions, Jacobians, Newton–Euler dynamics.',
      outcome: 'An Honors Contract modeling project that strengthened my interest in future prosthetics and exoskeleton research; no assistive device was built.',
      link: 'projects/leg.html', action: 'Read the complete project page'
    },
    {
      id: 'fingerprint', title: 'Fingerprint Authentication', edition: '2025 · Embedded systems',
      subtitle: 'A small system with meaningful communication challenges',
      story: 'Our four-person embedded-systems group built a standalone fingerprint identification system around an STM32F767ZI and an optical sensor. Instead of relying on the sensor library, the firmware uses manually constructed UART command packets and response parsing. A guided enrollment process lets users register prints, while green and red LEDs indicate matching results.',
      challenge: 'Coordinate reliable sensor enrollment, fingerprint searching, serial packets, and clear feedback for multiple users.',
      approach: 'Configure two UART channels, implement protocol framing and acknowledgment handling, map 24 template IDs to four users, and drive status LEDs and terminal messages.',
      tools: 'STM32F767ZI, embedded C, UART packet protocol, sensor integration, GPIO.',
      outcome: 'A group-built demonstration of enrollment, template matching, and embedded status reporting.',
      link: 'projects/fingerprint.html', action: 'Read the complete project page'
    },
    {
      id: 'motor', title: 'STM32 Motor Timing & PWM', edition: 'Fall 2025 · Embedded control coursework',
      subtitle: 'From timer registers to measured motor behavior',
      story: 'Working with an STM32F767ZI introduced the practical side of motor timing: configuring timer outputs, changing pulse-width modulation, and gathering response data to understand hardware behavior. Related microprocessor lab work also covered push-button inputs and direct GPIO control.',
      challenge: 'Generate controlled timing signals and relate PWM behavior to physical motor responses.',
      approach: 'Develop STM32 firmware for PWM-based motor control and encoder capture; examine logged motor-response timing. A related lab example sweeps the TIM3 channel 2 compare register to vary duty cycle.',
      tools: 'STM32F767ZI, embedded C, hardware timers, PWM, encoder capture, GPIO.',
      outcome: 'Experience connecting microcontroller peripherals, control timing, and experimental observations.',
      link: 'projects/motor.html', action: 'Read the complete project page'
    },
    {
      id: 'vhdl', title: 'VHDL Digital Logic', edition: 'EE421 · 2025 · Digital electronics',
      subtitle: 'Binary arithmetic displayed in decimal without a clock',
      story: 'For a digital electronics assignment, I developed purely combinational VHDL circuits that translate binary switch inputs into two-digit seven-segment output. A second design adds two 4-bit numbers and a carry-in and displays the result as a readable decimal value.',
      challenge: 'Convert binary values to decimal display patterns using concurrent hardware logic rather than clocked software-like control.',
      approach: 'Use XOR, AND, and OR equations with full-adder stages and lookup tables for active-low seven-segment displays. The adder produces a five-bit result representing 0 through 31.',
      tools: 'VHDL, combinational logic, full adders, lookup tables, seven-segment displays.',
      outcome: 'Synthesizable digital designs that demonstrate binary-to-decimal conversion and arithmetic display.',
      link: 'projects/vhdl.html', action: 'Read the complete project page'
    },
    {
      id: 'alu', title: 'Pipelined VHDL ALU', edition: 'EE421 · October 2025 · Digital design',
      subtitle: 'A clocked four-bit arithmetic and logic unit',
      story: 'I designed and tested a four-bit arithmetic and logic unit from a high-level datapath down to the individual logic blocks. Four chained one-bit full adders form the arithmetic core; registered inputs and outputs make the results stable and predictable. The design uses board switches and a pushbutton for commands, with LEDs and seven-segment displays as visible feedback.',
      challenge: 'Implement multiple arithmetic and logic operations with a one-clock-cycle registered interface and clearly observable hardware outputs.',
      approach: 'Combine a four-bit ripple-carry adder, operand selection logic, an XOR path, input/output flip-flops and a seven-segment decoder. Test pass-through, increment, addition, subtraction and XOR operations with representative switch settings.',
      tools: 'VHDL, ripple-carry adder, sequential logic, FPGA I/O mapping, binary LED readout, seven-segment display.',
      outcome: 'A tested synchronous design with outputs updating on the following clock cycle. Debugging pin assignments and competing LED drivers reinforced disciplined hardware integration.',
      link: 'projects/alu.html', action: 'Read the complete project page'
    },
    {
      id: 'controls', title: 'Control & Measurement Labs', edition: 'EE370L · Spring 2025 · Partner laboratory work',
      subtitle: 'Strain gauges, frequency response, and P/PID motor control',
      story: 'In four partner-based instrumentation and control laboratories, we connected models to bench measurements. We calibrated a strain-gauge amplifier and examined bending and vibration of a metal strip, measured RLC and motor frequency responses, then designed proportional and PID motor-speed controllers using MATLAB and physical controller boards. The valuable part was learning where theoretical predictions and measured hardware behavior disagreed.',
      challenge: 'Measure small strain signals and dynamic responses while implementing stable feedback control on real equipment.',
      approach: 'Use a strain-gauge half-bridge and calibrated amplifier, an oscilloscope and function generator for frequency sweeps, MATLAB step-response simulations, and op-amp controller circuits on a DC motor board. Compare rise time, settling time, phase response, and overshoot between models and measurements.',
      tools: 'MATLAB, P/PID feedback, strain gauges, Wheatstone bridge, RLC frequency response, oscilloscope, function generator, DC motor controller board.',
      outcome: 'The strain experiment characterized vibration near 49.3 Hz. Increasing proportional gain shortened measured rise and settling times, but P-control experiments showed roughly tenfold differences from the simulation; some PID measurements differed by over 50%. These discrepancies motivated stronger component and setup verification.',
      link: 'projects/controls.html', action: 'Read the complete project page'
    },
    {
      id: 'iverify', title: 'IVerify', edition: 'Capstone · 2026 · Health technology',
      subtitle: 'A non-invasive IV occlusion detection concept',
      story: 'As project lead and systems integrator on a four-person senior-design team, I coordinated development of a non-invasive clip-on concept for gravity-fed IV tubing. The system applies repeatable mechanical preload and senses the tube reaction force as an indirect indicator of restrictions. Analog filtering and threshold logic feed microcontroller supervision, translating measurements into understandable status indications.',
      challenge: 'Detect possible downstream flow restrictions without cutting, puncturing, or entering the sterile fluid pathway.',
      approach: 'Integrate a clamp, force sensor, analog front end, threshold detection, microcontroller state logic, and a visual interface. The product concept defined normal, partial-restriction, and occlusion states.',
      tools: 'Mechanical sensing, signal conditioning, threshold logic, embedded systems, risk analysis, verification planning.',
      outcome: 'A bench-level, non-clinical proof of concept using two indicator LEDs. The proposed full three-color interface and clinical performance still required further testing.',
      link: 'projects/iverify.html', action: 'Read the complete project page'
    },
    {
      id: 'thermal', title: 'Thermal Controller & Logger', edition: '2025–2026 · Test automation',
      subtitle: 'Making temperature measurements easier to trust',
      story: 'I built tools to take repetitive engineering thermal tests and make them easier to monitor, compare, and document. The interesting part was not just collecting numbers, but helping engineers recognize stable conditions and produce repeatable reports.',
      challenge: 'Manual monitoring and inconsistent reporting slow down thermal validation.',
      approach: 'Combine Python data collection and live visualization with Arduino ambient control, stability tracking, and structured exports.',
      tools: 'Python, Arduino, Tkinter, temperature instrumentation, CSV and Excel.',
      outcome: 'A more traceable and repeatable thermal-testing workflow.',
      link: 'projects/thermal.html', action: 'Read the complete project page'
    },
    {
      id: 'vna', title: 'Virtual Network Analyzer', edition: '2025 · RF measurements',
      subtitle: 'Turning RF measurements into readable engineering data',
      story: 'For this measurement project, I used software to connect calibration, data acquisition, and visualization. I liked that even careful RF work could become easier to examine and communicate through automation.',
      challenge: 'Automate two-port RF measurements while accounting for calibration errors.',
      approach: 'Control the measurement workflow in MATLAB, use 12-term SOLT calibration, and visualize S-parameters.',
      tools: 'MATLAB, two-port VNA, RF calibration, S-parameter visualization.',
      outcome: 'An automated analysis workflow covering 100 MHz to 6 GHz.',
      link: 'projects/vna.html', action: 'Read the complete project page'
    },
    {
      id: 'hall', title: 'Hall-Effect Wafer Measurements', edition: 'EE421 · December 2025 · Semiconductor lab',
      subtitle: 'Characterizing charge carriers in a semiconductor wafer',
      story: 'I used a semiconductor measurement setup to investigate the electrical transport properties of a wafer. The experiment combined the Hall effect with Van der Pauw measurements, connecting an applied magnetic field and measured voltage to resistivity, carrier type, concentration, and mobility. It also taught me how easily physical contacts and sample setup can influence what seems like a simple number.',
      challenge: 'Determine wafer resistivity and Hall transport characteristics while checking the validity of the contacts and measurement setup.',
      approach: 'Position the sample on a four-contact Van der Pauw stage, check contact behavior, and collect Hall and resistivity data with the M91 FastHall controller and MeasureLINK software.',
      tools: 'Hall effect, Van der Pauw method, M91 FastHall, electromagnet, MeasureLINK, semiconductor characterization.',
      outcome: 'Hands-on wafer characterization. The measured values had substantial uncertainty and unexpected trends, so the results were treated as a measurement-quality lesson rather than a definitive material specification.',
      link: 'projects/hall.html', action: 'Read the complete project page'
    },
    {
      id: 'prodriver', title: 'ProDriver Sim', edition: 'GitHub · Electrical simulation',
      subtitle: 'Putting LED-driver behavior into a model',
      story: 'I wanted a tool that could connect electrical measurements with predictions. The simulation provides a way to compare driver and fixture behavior with observed bench results.',
      challenge: 'Estimate how electrical operating conditions affect an LED driver and fixture.',
      approach: 'Model voltage, current, load, and efficiency; compare predicted behavior with measurements.',
      tools: 'Python, PyQt6, electrical modeling, bench testing.',
      outcome: 'An engineering tool for comparing model behavior and measured values.',
      link: 'projects/prodriver.html', action: 'Read the complete project page'
    },
    {
      id: 'huemotion', title: 'HueMotion', edition: 'GitHub · Human interaction',
      subtitle: 'Turning hand gestures into lighting responses',
      story: 'HueMotion explores what happens when a familiar action becomes an interface. By interpreting hand gestures from a webcam, the project connects human movement to responsive RGBW lighting.',
      challenge: 'Make gesture recognition useful for controlling lighting in an intuitive way.',
      approach: 'Track hands with MediaPipe and map gesture states to lighting controls and a browser preview.',
      tools: 'JavaScript, MediaPipe, Node.js, webcam tracking, RGBW lighting.',
      outcome: 'A gesture-driven prototype with an optional local Casambi bridge.',
      link: 'projects/huemotion.html', action: 'Read the complete project page'
    },
    {
      id: 'dmx', title: 'DMX Controller', edition: 'GitHub · Lighting control',
      subtitle: 'A browser interface connected to physical lights',
      story: 'This project brings a familiar browser interface to a hardware lighting-control problem. Choosing a scene or brightness setting produces commands for an Arduino-based DMX system.',
      challenge: 'Translate simple user controls into real output for RGBW lighting hardware.',
      approach: 'Use Flask to receive browser inputs and send serial commands to Arduino for DMX output.',
      tools: 'Python, Flask, Arduino, serial communication, DMX.',
      outcome: 'A direct connection between software controls and physical lighting response.',
      link: 'projects/dmx.html', action: 'Read the complete project page'
    },
    {
      id: 'powershell', title: 'PowerShell Systems & Concurrency', edition: 'CS646 · Fall 2026 · Operating systems coursework',
      subtitle: 'Inventory, safe CSV processing, and synchronized parallel tasks',
      story: 'Across three operating-systems labs, I developed PowerShell scripts inside a Linux course container. The first inventoried the operating system and visible CPU, memory, storage, network interfaces, and packages. The second safely sorted complete CSV records without overwriting the source. The third explored how concurrent web requests improve throughput while creating new risks around shared files and ordering.',
      challenge: 'Build scripts that behave correctly in a container, preserve input integrity, and safely coordinate shared resources.',
      approach: 'Use Linux system interfaces with PowerShell for inventory; validate CSV fields and rows, compare SHA256 input hashes and append audit logs; then run 102 requests across three services with a throttle limit of 10, synchronization tests, and thread/process observations.',
      tools: 'PowerShell, Debian Linux, containers, CSV processing, SHA256, ForEach-Object -Parallel, file locking, strace, ps.',
      outcome: 'A six-row CSV test preserved the source, and larger sorting tests included 300,000 records. In one concurrency comparison, 102 requests took 8.69 s serially versus 1.68 s concurrently; locking also corrected a shared-counter race from 2 to the expected 100.',
      link: 'projects/powershell.html', action: 'Read the complete project page'
    },
  ];

  const dialog = document.getElementById('project-book-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const stage = document.getElementById('book-open-stage');
  const closeBtn = document.getElementById('close-project-book');
  const pageStatus = document.getElementById('book-page-status');
  const previous = document.getElementById('book-previous');
  const bookSwitchSelect = document.getElementById('book-switch-select');
  // Use the same project records as the books, so the titles cannot drift.
  if (bookSwitchSelect) {
    books.forEach((book, index) => {
      const option = document.createElement('option');
      option.value = book.id;
      option.textContent = String(index + 1).padStart(2, '0') + ' · ' + book.title;
      bookSwitchSelect.appendChild(option);
    });
  }
  const next = document.getElementById('book-next');
  const counter = document.getElementById('book-counter');
  const coverTitle = document.getElementById('book-cover-title');
  const detailLink = document.getElementById('book-project-link');
  const nextPage = document.getElementById('book-next-page');
  const previousPage = document.getElementById('book-prev-page');
  const fields = {
    edition: document.getElementById('book-edition'),
    title: document.getElementById('book-modal-title'),
    subtitle: document.getElementById('book-modal-intro'),
    story: document.getElementById('book-story'),
    challenge: document.getElementById('book-challenge'),
    approach: document.getElementById('book-approach'),
    tools: document.getElementById('book-tools'),
    outcome: document.getElementById('book-outcome')
  };
  const bookButtons = [...document.querySelectorAll('[data-open-book]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selectedIndex = 0;
  let lastTrigger = null;
  let pullTimer = null;
  let openTimer = null;
  let turnTimer = null;
  let finishTurnTimer = null;
  let isOpening = false;
  let isTurning = false;
  const shelfStrips = [...document.querySelectorAll('.shelf-books')];
  const savedReadingPages = new Map();
  let shelfScrollBeforeOpen = [];
  let pageScrollBeforeOpen = 0;

  function updateReadingStatus() {
    if (!pageStatus || !stage) return;
    const second = stage.dataset.mobilePage === '2';
    pageStatus.textContent = second
      ? 'Page 2 of 2 · Engineering details'
      : 'Page 1 of 2 · Project story';
  }

  function clearTimers() {
    [pullTimer, openTimer, turnTimer, finishTurnTimer].forEach(id => {
      if (id !== null) window.clearTimeout(id);
    });
    pullTimer = openTimer = turnTimer = finishTurnTimer = null;
  }

  function syncNavigation() {
    if (previous) previous.disabled = isOpening || isTurning || selectedIndex === 0;
    if (next) next.disabled = isOpening || isTurning || selectedIndex === books.length - 1;
    if (bookSwitchSelect) bookSwitchSelect.disabled = isOpening || isTurning;
  }

  // Project information is filled from trusted, authored text only.
  function renderBook(index) {
    if (index < 0 || index >= books.length) return;
    selectedIndex = index;
    const book = books[index];
    if (bookSwitchSelect) bookSwitchSelect.value = book.id;
    for (const [name, element] of Object.entries(fields)) {
      if (element) element.textContent = book[name];
    }
    if (detailLink) {
      detailLink.href = book.link;
      detailLink.textContent = book.action + (book.link.startsWith('http') ? ' ↗' : ' →');
      if (book.link.startsWith('http')) {
        detailLink.target = '_blank';
        detailLink.rel = 'noopener noreferrer';
      } else {
        detailLink.removeAttribute('target');
        detailLink.removeAttribute('rel');
      }
    }

    if (counter) counter.textContent = 'Book ' + (index + 1) + ' of ' + books.length;
    if (coverTitle) coverTitle.textContent = book.title;
    if (stage) stage.dataset.mobilePage = String(savedReadingPages.get(book.id) || 1);
    updateReadingStatus();

    // Match the opening hardback cover to the selected spine.
    const spine = bookButtons.find(button => button.dataset.openBook === book.id);
    if (spine && stage) {
      const style = getComputedStyle(spine);
      stage.style.setProperty('--active-book-color', style.getPropertyValue('--spine').trim() || '#874861');
      stage.style.setProperty('--active-book-border', style.getPropertyValue('--spine-border').trim() || '#54354a');
    }
    syncNavigation();
  }

  function setBookStage(state) {
    if (!stage) return;
    stage.classList.remove('is-closed', 'is-opening', 'is-open', 'page-turn-next', 'page-turn-prev', 'page-turn-mobile-forward', 'page-turn-mobile-backward');
    stage.classList.add(state);
  }

  function beginOpening(index, trigger) {
    if (dialog.open || pullTimer !== null) return;
    clearTimers();
    lastTrigger = trigger;
    pageScrollBeforeOpen = window.scrollY;
    shelfScrollBeforeOpen = shelfStrips.map(strip => strip.scrollLeft);
    trigger.classList.add('is-pulling');
    isOpening = !reduceMotion.matches;
    isTurning = false;
    renderBook(index);
    setBookStage('is-closed');
    syncNavigation();

    // First pull the spine slightly out of the shelf. Then reveal a closed
    // hardcover that physically swings open on its center hinge.
    pullTimer = window.setTimeout(() => {
      trigger.classList.remove('is-pulling');
      dialog.showModal();
      dialog.scrollTop = 0;
      closeBtn?.focus({ preventScroll: true });

      if (reduceMotion.matches) {
        isOpening = false;
        setBookStage('is-open');
        syncNavigation();
        return;
      }

      // Paint the closed cover before starting the opening transition.
      void stage?.offsetWidth;
      window.requestAnimationFrame(() => {
        if (!dialog.open) return;
        setBookStage('is-opening');
      });

      openTimer = window.setTimeout(() => {
        if (!dialog.open) return;
        isOpening = false;
        setBookStage('is-open');
        syncNavigation();
        openTimer = null;
      }, 1120);
      pullTimer = null;
    }, reduceMotion.matches ? 0 : 210);
  }

  function turnTo(index, direction) {
    if (!dialog.open || isOpening || isTurning || index < 0 || index >= books.length) return;

    if (reduceMotion.matches) {
      renderBook(index);
      dialog.scrollTop = 0;
      return;
    }

    isTurning = true;
    syncNavigation();
    stage?.classList.add(direction > 0 ? 'page-turn-next' : 'page-turn-prev');

    // Replace the book's text halfway through the paper's 3D turn.
    turnTimer = window.setTimeout(() => {
      renderBook(index);
      dialog.scrollTop = 0;
      turnTimer = null;
    }, 340);

    finishTurnTimer = window.setTimeout(() => {
      stage?.classList.remove('page-turn-next', 'page-turn-prev', 'page-turn-mobile-forward', 'page-turn-mobile-backward');
      isTurning = false;
      syncNavigation();
      finishTurnTimer = null;
    }, 760);
  }

  // On narrow screens a real book presents one printed page at a time.
  // The two in-page controls turn between the story and the engineering notes.
  function turnMobilePage(nextPageNumber) {
    if (!dialog.open || isOpening || isTurning || !stage) return;
    const current = stage.dataset.mobilePage || '1';
    if (current === String(nextPageNumber)) return;

    if (reduceMotion.matches) {
      stage.dataset.mobilePage = String(nextPageNumber);
      savedReadingPages.set(books[selectedIndex].id, nextPageNumber);
      updateReadingStatus();
      dialog.scrollTop = 0;
      return;
    }

    isTurning = true;
    syncNavigation();
    const name = nextPageNumber === 2 ? 'page-turn-mobile-forward' : 'page-turn-mobile-backward';
    stage.classList.add(name);
    turnTimer = window.setTimeout(() => {
      stage.dataset.mobilePage = String(nextPageNumber);
      savedReadingPages.set(books[selectedIndex].id, nextPageNumber);
      updateReadingStatus();
      dialog.scrollTop = 0;
      turnTimer = null;
    }, 285);
    finishTurnTimer = window.setTimeout(() => {
      stage.classList.remove(name);
      isTurning = false;
      syncNavigation();
      finishTurnTimer = null;
    }, 620);
  }

  nextPage?.addEventListener('click', () => turnMobilePage(2));
  previousPage?.addEventListener('click', () => turnMobilePage(1));

  bookButtons.forEach(button => button.addEventListener('click', () => {
    const index = books.findIndex(book => book.id === button.dataset.openBook);
    if (index >= 0) beginOpening(index, button);
  }));

  // Open a featured case study directly while retaining a working
  // hash destination if JavaScript is unavailable.
  document.querySelectorAll('[data-open-feature-book]').forEach(link => {
    link.addEventListener('click', event => {
      const index = books.findIndex(book => book.id === link.dataset.openFeatureBook);
      if (index < 0) return;
      event.preventDefault();
      beginOpening(index, link);
    });
  });

  // Keyboard arrows navigate within the two eight-book shelves.
  const shelfRows = [...document.querySelectorAll('.shelf-books')].map(strip =>
    [...strip.querySelectorAll('[data-open-book]')]
  );
  bookButtons.forEach(button => button.addEventListener('keydown', event => {
    const rowIndex = shelfRows.findIndex(row => row.includes(button));
    if (rowIndex < 0) return;
    const row = shelfRows[rowIndex];
    const columnIndex = row.indexOf(button);
    let target;
    if (event.key === 'ArrowRight') target = row[(columnIndex + 1) % row.length];
    else if (event.key === 'ArrowLeft') target = row[(columnIndex - 1 + row.length) % row.length];
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const otherRow = shelfRows[(rowIndex + direction + shelfRows.length) % shelfRows.length];
      target = otherRow[Math.min(columnIndex, otherRow.length - 1)];
    } else return;
    event.preventDefault();
    target?.focus();
  }));

  // One stable preview beneath each shelf updates on mouse hover or focus.
  const booksById = new Map(books.map(book => [book.id, book]));
  bookButtons.forEach(button => {
    const book = booksById.get(button.dataset.openBook);
    const shelf = button.closest('.shelf-level');
    const preview = shelf?.querySelector('[data-shelf-preview]');
    const title = preview?.querySelector('[data-preview-title]');
    const summary = preview?.querySelector('[data-preview-text]');
    if (!book || !title || !summary) return;
    button.setAttribute('aria-label', 'Open ' + book.title + '. ' + book.subtitle);
    const show = () => {
      title.textContent = book.title;
      summary.textContent = book.subtitle;
      shelf.classList.add('is-previewing');
    };
    button.addEventListener('mouseenter', show);
    button.addEventListener('focus', show);
  });

  closeBtn?.addEventListener('click', () => dialog.close());
  previous?.addEventListener('click', () => turnTo(selectedIndex - 1, -1));
  next?.addEventListener('click', () => turnTo(selectedIndex + 1, 1));
  bookSwitchSelect?.addEventListener('change', () => {
    const index = books.findIndex(book => book.id === bookSwitchSelect.value);
    if (index < 0 || !dialog.open || isOpening || isTurning) {
      bookSwitchSelect.value = books[selectedIndex].id;
      return;
    }
    if (index !== selectedIndex) turnTo(index, index > selectedIndex ? 1 : -1);
  });

  detailLink?.addEventListener('click', () => {
    if (detailLink.getAttribute('href')?.startsWith('#')) {
      lastTrigger = null;
      dialog.close();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    clearTimers();
    isOpening = false;
    isTurning = false;
    if (stage) savedReadingPages.set(books[selectedIndex].id, Number(stage.dataset.mobilePage || 1));
    stage?.classList.remove('page-turn-next', 'page-turn-prev', 'page-turn-mobile-forward', 'page-turn-mobile-backward');
    setBookStage('is-closed');
    bookButtons.forEach(button => {
      button.classList.remove('is-pulling');
      button.classList.toggle('last-opened', button.dataset.openBook === books[selectedIndex].id);
    });
    syncNavigation();
    // Restore vertical position and the horizontal offset of each shelf.
    const trigger = lastTrigger;
    lastTrigger = null;
    if (trigger) {
      shelfStrips.forEach((strip, i) => { strip.scrollLeft = shelfScrollBeforeOpen[i] || 0; });
      document.documentElement.classList.add('restoring-shelf-position');
      try { trigger.focus({ preventScroll: true }); } catch (_) { trigger.focus(); }
      window.scrollTo({ top: pageScrollBeforeOpen, behavior: 'auto' });
      window.requestAnimationFrame(() => {
        shelfStrips.forEach((strip, i) => { strip.scrollLeft = shelfScrollBeforeOpen[i] || 0; });
        window.scrollTo({ top: pageScrollBeforeOpen, behavior: 'auto' });
        document.documentElement.classList.remove('restoring-shelf-position');
      });
    }
  });

  // Latin spine titles are rotated vertically. Measure their full rendered
  // length instead of hiding any letters in a fixed-height book jacket.
  // Refit when web fonts finish loading and whenever the viewport resizes.
  let fitFrame = null;
  function fitSpineTitles() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Always recalculate from CSS, rather than carrying over a previous
    // narrowed font size when rotating the phone or changing zoom.
    bookButtons.forEach(button => {
      button.style.removeProperty('height');
      button.querySelector('.book-spine-title')?.style.removeProperty('font-size');
    });
    if (!context) return;

    bookButtons.forEach(button => {
      const title = button.querySelector('.book-spine-title');
      if (!title) return;

      const style = window.getComputedStyle(title);
      const nominal = Number.parseFloat(style.fontSize) || 15;
      const padding = (Number.parseFloat(style.paddingTop) || 0)
        + (Number.parseFloat(style.paddingBottom) || 0);
      const space = Math.max(1, title.clientHeight - padding - 8);
      const content = (title.textContent || '').trim();
      if (!content) return;

      const measure = size => {
        context.font = style.fontStyle + ' ' + style.fontWeight + ' ' +
          size + 'px ' + style.fontFamily;
        return context.measureText(content).width;
      };
      let size = nominal;
      const required = measure(nominal);
      if (required > space) {
        size = Math.max(10, Math.floor((nominal * space / required) * 95) / 100);
        title.style.fontSize = size.toFixed(2) + 'px';
      }

      // At unusually large accessibility text settings, extend the physical
      // book rather than clip the name even at our minimum readable size.
      const actualSpace = Math.max(1, title.clientHeight - padding - 8);
      const remaining = measure(size) - actualSpace;
      if (remaining > 0) {
        const currentHeight = button.getBoundingClientRect().height;
        button.style.height = Math.ceil(currentHeight + remaining + 8) + 'px';
      }
    });
  }

  function scheduleSpineFit() {
    if (fitFrame !== null) window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(() => {
      fitFrame = null;
      fitSpineTitles();
    });
  }

  scheduleSpineFit();
  window.addEventListener('resize', scheduleSpineFit, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleSpineFit);
  }

  renderBook(0);
})();
