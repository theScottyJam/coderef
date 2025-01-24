function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function generateCodeRefWithoutPrefix() {
  const CHOICES = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    .replace(/[l1oO0]/g, ''); // Some characters removed for readability

  const arrayOfLength = length => new Array(length).fill();

  const genChar = () => CHOICES[Math.floor(Math.random() * CHOICES.length)];
  return arrayOfLength(5).map(genChar).join('');
}

{
  class Transitioner {
    #cancel = undefined;
    #el;
    constructor(el) {
      this.#el = el;
    }

    async run(effects) {
      this.#cancel?.();

      const canceledError = new Error('Canceled');

      try {
        for (const { key, value, delay } of effects) {
          this.#el.style.transition = `${key} ${delay}`;
          this.#el.style[key] = value;
          const { resolve, reject, promise } = Promise.withResolvers();
          this.#cancel = () => reject(canceledError);
          const onTransitionEnd = () => resolve();
          this.#el.addEventListener('transitionend', onTransitionEnd);
          try {
            await promise;
          } finally {
            this.#el.removeEventListener('transitionend', onTransitionEnd);
          }
        }
      } catch (error) {
        if (error === canceledError) {
          return;
        } else {
          throw error;
        }
      } finally {
        this.#cancel = undefined;
      }
    }
  }

  const codeRefViewerEl = document.querySelector('#code-ref-viewer');
  const codeRefViewerWithoutPrefixEl = document.querySelector('#code-ref-viewer-without-prefix');
  const copyToClipboardEl = document.querySelector('#copy-to-clipboard');
  const generateNewCoderefEl = document.querySelector('#generate-new-coderef');
  const infoButtonEl = document.querySelector('#info-button');
  const copyFailedToast = document.querySelector('#copy-failed-toast');

  codeRefViewerWithoutPrefixEl.textContent = generateCodeRefWithoutPrefix();

  const selectCodeRef = () => {
    const range = document.getSelection();
    range.selectAllChildren(codeRefViewerEl);
  };
  selectCodeRef();

  codeRefViewerEl.addEventListener('mouseup', event => {
    // If the user wasn't trying to make a selection, select everything.
    if (codeRefViewerEl.selectionStart === codeRefViewerEl.selectionEnd) { // TODO: selectionStart/end probably don't work
      selectCodeRef();
    }
  });

  generateNewCoderefEl.addEventListener('click', () => {
    codeRefViewerWithoutPrefixEl.textContent = generateCodeRefWithoutPrefix();
    selectCodeRef();
  });

  let failedToastTimeout = undefined;
  const copyCompleteEffect = new Transitioner(codeRefViewerEl);
  copyToClipboardEl.addEventListener('click', () => {
    const copyUnavailableRejection = async () => {
      // The navigator.clipboard property isn't always available, such as
      // if you try to access the locally running webpage through a 192.168.*.* address.
      // With normal usage, this won't be a problem.
      throw new Error('The copy functionality is unavailable.');
    }

    navigator.clipboard?.writeText(codeRefViewerEl.textContent) ?? copyUnavailableRejection()
      .catch(error => {
        copyCompleteEffect.run([
          { delay: '0.01s', key: 'color', value: 'oklch(0.65 0.15 375)' },
          { delay: '0.8s', key: 'color', value: '' },
        ]);

        if (failedToastTimeout) {
          clearTimeout(failedToastTimeout);
        }

        copyFailedToast.textContent = error.message;
        copyFailedToast.classList.add('show');
        failedToastTimeout = setTimeout(() => {
          copyFailedToast.classList.remove('show');
          failedToastTimeout = undefined;
        }, 5000);

        throw error;
      })
      .then(() => {
        copyCompleteEffect.run([
          { delay: '0.01s', key: 'color', value: 'oklch(0.65 0.15 140)' },
          { delay: '0.5s', key: 'color', value: '' },
        ]);
      });
  });

  infoButtonEl.addEventListener('click', () => {
    document.body.classList.toggle('show-info-panel')
    if (infoButtonEl.textContent === 'ⓘ') {
      infoButtonEl.textContent = '✖';
    } else {
      infoButtonEl.textContent = 'ⓘ';
    }
  });
}

function generateSvgPath(points, r = 1) {
  let path = [];
  for (const [i, point] of points.entries()) {
    if (!point.curve) {
      const char = path.length === 0 ? 'M' : 'L';
      path.push(`${char} ${point.x*r} ${point.y*r}`);
    } else {
      const previousPoint = points[i - 1];
      const nextPoint = points[i + 1];
      assert(previousPoint && nextPoint);

      // point.curve.radius: Intended to feel somewhat similar to border-radius sizes.
      //   It represents a distance away from the point in which the curving starts.
      // point.curve.strength: How strong the curve is, from 0 to 1.

      const { sin, cos, atan, abs } = Math;

      const entranceSlope = (point.y - previousPoint.y) / (point.x - previousPoint.x)
      const entranceSlopeMovesRight = point.x - previousPoint.x > 0
      const entranceSlopeMovesUp = point.y - previousPoint.y > 0

      const curveStartPoint = {
        x: point.x + cos(atan(abs(entranceSlope))) * point.curve.radius * (entranceSlopeMovesRight ? -1 : 1),
        y: point.y + sin(atan(abs(entranceSlope))) * point.curve.radius * (entranceSlopeMovesUp ? -1 : 1),
      };

      const exitSlope = (nextPoint.y - point.y) / (nextPoint.x - point.x)
      const exitSlopeMovesRight = nextPoint.x - point.x > 0
      const exitSlopeMovesUp = nextPoint.y - point.y > 0

      const curveEndingPoint = {
        x: point.x + cos(atan(Math.abs(exitSlope))) * point.curve.radius * (exitSlopeMovesRight ? 1 : -1),
        y: point.y + sin(atan(Math.abs(exitSlope))) * point.curve.radius * (exitSlopeMovesUp ? 1 : -1),
      };

      const handle1 = {
        x: curveStartPoint.x + (point.x - curveStartPoint.x) * point.curve.strength,
        y: curveStartPoint.y + (point.y - curveStartPoint.y) * point.curve.strength,
      };

      const handle2 = {
        x: curveEndingPoint.x + (point.x - curveEndingPoint.x) * point.curve.strength,
        y: curveEndingPoint.y + (point.y - curveEndingPoint.y) * point.curve.strength,
      };

      path.push(`L ${curveStartPoint.x*r} ${curveStartPoint.y*r}`);
      path.push(`C ${handle1.x*r} ${handle1.y*r} ${handle2.x*r} ${handle2.y*r} ${curveEndingPoint.x*r} ${curveEndingPoint.y*r}`);
    }
  }
  path.push('Z');
  return "path('" + path.join(' ') + "')";
}

// This list is filled by the createBackgroundEl(), and used elsewhere.
let backgroundStylesheetContent = [];
let nextBackgroundElId = 0;
function createBackgroundEl(createStyle) {
  const className = `bg-el-${nextBackgroundElId++}`;
  const bgEl = document.createElement('div');
  bgEl.classList.add(className);
  backgroundStylesheetContent.push(
    `.${className} {`,
    '  position: absolute;',
    createStyle?.static ?? '',
    '}',
    `body.show-info-panel .${className} {`,
    createStyle?.withInfoPanel ?? '',
    '}',
  )

  const ASPECT_RATIO_WIDTH = 1280;
  const ASPECT_RATIO_HEIGHT = 720;
  const ratios = [0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.5, 3, 5];

  if (createStyle.mobile) {
    backgroundStylesheetContent.push(
      `@media screen and (width < ${ratios[0] * ASPECT_RATIO_WIDTH}px),`,
      `screen and (height < ${ratios[0] * ASPECT_RATIO_HEIGHT}px) {`,
      `  .${className} {`,
      createStyle.mobile,
      '  }',
      '}',
    )
  }

  if (createStyle.desktop) {
    for (const [i, r] of ratios.entries()) {
      let maxBoundClause = '';
      if (ratios[i+1] !== undefined) {
        maxBoundClause = ` and ((width < ${ratios[i+1]*ASPECT_RATIO_WIDTH}px) or (height < ${ratios[i+1]*ASPECT_RATIO_HEIGHT}px))`;
      }
      backgroundStylesheetContent.push(
        `@media screen and (width >= ${r*ASPECT_RATIO_WIDTH}px) and (height >= ${r*ASPECT_RATIO_HEIGHT}px)${maxBoundClause} {`,
        `  .${className} {`,
        createStyle.desktop(r),
        '  }',
        '}',
      )
    }
  }

  backgroundStylesheetContent.push('');
  document.querySelector('.bg-container').append(bgEl);
}

function generateBackground() {
  /* ~~ Left sky ~~ */
  {
    const background = 'oklch(0.65 0.15 210)';
    const backgroundWithPanel = 'oklch(0.62 0 210)';
    createBackgroundEl({
      static: `
        left: calc(50% - 450px);
        top: calc(40% - 200px);
        width: 300px;
        height: 400px;
        background: ${background};
        clip-path: ${generateSvgPath([
          { x: 0, y: 0 },
          { x: 130, y: 0 },
          { x: 130, y: 300, curve: { radius: 80, strength: 0.75 } },
          { x: 210, y: 300 },
          { x: 210, y: 400 },
          { x: 0, y: 400 },
        ])};
      `,
      withInfoPanel: `
        background: ${backgroundWithPanel};
      `,
      mobile: `
        display: none;
      `,
    });
    createBackgroundEl({
      static: `
        left: 0;
        top: 0;
        width: calc(50% - 450px + 130px);
        height: calc(40% - 200px + 400px);
        background: ${background};
      `,
      withInfoPanel: `
        background: ${backgroundWithPanel};
      `,
      mobile: `
        display: none;
      `,
    });
    createBackgroundEl({
      static: `
        left: 0;
        top: calc(40% - 200px + 400px);
        width: calc(50% - 450px + 210px);
        bottom: 0;
        background: ${background};
      `,
      withInfoPanel: `
        background: ${backgroundWithPanel};
      `,
      mobile: `
        display: none;
      `,
    });
  }

  /* ~~ Background tree ~~ */

  createBackgroundEl({
    static: `
      background: oklch(0.65 0.15 165);
    `,
    withInfoPanel: `
      background: oklch(0.65 0 165);
    `,
    desktop: r => `
      left: calc(50% - ${450}px + ${210}px - ${r*290}px - ${r*150}px);
      bottom: 0;
      width: ${r*300}px;
      height: ${r*500}px;
      clip-path: ${generateSvgPath([
        { x: 20, y: 500 },
        { x: 180, y: 90, curve: { radius: 80, strength: 0.3 } },
        { x: 250, y: 500 },
      ], r)};
    `,
    mobile: ((r=0.5) => `
      left: 20px;
      bottom: 0;
      width: ${r*300}px;
      height: ${r*500}px;
      clip-path: ${generateSvgPath([
        { x: 20, y: 500 },
        { x: 180, y: 90, curve: { radius: 80, strength: 0.3 } },
        { x: 250, y: 500 },
      ], r)};
    `)(),
  });

  /* ~~ Foreground tree ~~ */

  createBackgroundEl({
    static: `
      background: oklch(0.65 0.15 140);
    `,
    withInfoPanel: `
      background: oklch(0.65 0 140);
    `,
    desktop: r => `
      left: calc(50% - ${450}px + ${210}px - ${r*290}px);
      bottom: 0;
      width: ${r*300}px;
      height: ${r*500}px;
      clip-path: ${generateSvgPath([
        { x: 0, y: 500 },
        { x: 150, y: 50, curve: { radius: 30, strength: 0.5 } },
        { x: 270, y: 410, curve: { radius: 10, strength: 0.2 } },
        { x: 270, y: 500 },
      ], r)};
    `,
    mobile: ((r=0.5) => `
      left: 90px;
      bottom: 0;
      width: ${r*300}px;
      height: ${r*500}px;
      clip-path: ${generateSvgPath([
        { x: 0, y: 500 },
        { x: 150, y: 50, curve: { radius: 30, strength: 0.5 } },
        { x: 270, y: 500 },
      ], r)};
    `)(),
  });

  /* ~~ Sun ~~ */

  createBackgroundEl({
    static: `
      background: oklch(0.65 0.15 110);
    `,
    withInfoPanel: `
      background: oklch(0.69 0 110);
    `,
    desktop: r => `
      top: 0;
      right: 0;
      width: ${r*700}px;
      height: ${r*700}px;
      clip-path: ${generateSvgPath([
        { x: 200, y: 0 },
        { x: 0, y: 180, curve: { radius: 80, strength: 0.6 } },
        { x: 200, y: 700, curve: { radius: 10, strength: 0.6 } },
        { x: 700, y: 400 },
        { x: 700, y: 250 },
        { x: 480, y: 0 },
      ], r)};
    `,
    mobile: ((r=0.6) => `
      top: 0;
      right: 0;
      width: ${r*700}px;
      height: ${r*700}px;
      clip-path: ${generateSvgPath([
        { x: 200, y: 0 },
        { x: 0, y: 180, curve: { radius: 80, strength: 0.6 } },
        { x: 200, y: 700, curve: { radius: 10, strength: 0.6 } },
        { x: 700, y: 400 },
        { x: 700, y: 250 },
        { x: 480, y: 0 },
      ], r)};
    `)(),
  });
  
  /* ~~ Land mass ~~ */

  {
    const background = 'oklch(0.65 0.15 30)'; // §6cyGY
    const backgroundWithPanel = 'oklch(0.65 0 30)'; // §mgHAH
    createBackgroundEl({
      static: `
        background: ${background};
      `,
      withInfoPanel: `
        background: ${backgroundWithPanel};
      `,
      desktop: r => `
        bottom: 0;
        right: 0;
        width: ${r*800}px;
        height: ${r*200}px;
        clip-path: ${generateSvgPath([
          { x: 50, y: 200 },
          { x: 180, y: 140, curve: { radius: 40, strength: 0.5 } },
          { x: 430, y: 110 },
          { x: 650, y: 0, curve: { radius: 40, strength: 0.7 } },
          { x: 800, y: 100 },
          { x: 800, y: 200 },
        ], r)};
      `,
      mobile: ((r=0.5) => `
        bottom: 0;
        right: 0;
        width: ${r*800}px;
        height: ${r*200}px;
        clip-path: ${generateSvgPath([
          { x: 50, y: 200 },
          { x: 180, y: 140, curve: { radius: 40, strength: 0.5 } },
          { x: 430, y: 110 },
          { x: 650, y: 0, curve: { radius: 40, strength: 0.7 } },
          { x: 800, y: 100 },
          { x: 800, y: 200 },
        ], r)};
      `)(),
    });
    createBackgroundEl({
      static: `
        transform: rotate(-0.8deg);
        transform-origin: 100% 50%;
        background: ${background};
      `,
      withInfoPanel: `
        background: ${backgroundWithPanel};
      `,
      desktop: r => `
        left: 0;
        bottom: 0;
        width: 100%;
        height: ${r*30}px;
      `,
      mobile: `
        left: 0;
        bottom: 0;
        width: 100%;
        height: 15px;
      `,
    });
  }
  
  /* ~~ Center pill ~~ */

  createBackgroundEl({
    static: `
      display: flex;
      justify-content: center;
      align-items: center;
    
      border-top-left-radius: 40px;
      border-bottom-left-radius: 40px;
      background: black;
    `,
    withInfoPanel: `
      background: oklch(0.65 0 0);
    `,
    desktop: r => `
      left: calc(50% - ${300}px);
      top: calc(40% - ${80}px);
      width: ${600}px;
      height: ${160}px;
    `,
    mobile: `
      left: 20px;
      top: calc(40% - 80px);
      width: calc(100% - 20px);
      height: 160px;
    `,
  });

  const stylesheet = document.createElement('style');
  stylesheet.textContent = backgroundStylesheetContent.join('\n');
  document.head.append(stylesheet);
}

generateBackground();
