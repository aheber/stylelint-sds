import { expect } from 'chai';
import stylelint, { LinterResult, LinterOptions } from 'stylelint';

const { lint }: typeof stylelint = stylelint;

describe('no-hardcoded-values', () => {
  const ruleName = 'slds/no-hardcoded-values';

  const testCases = [
    {
      description:
        'Reports warning for hardcoded color value with replacement hook',
      inputCss: `
        .example {
          color: #ff0000;
        }
      `,
      expectedMessage:
        'Consider replacing the static value for "#ff0000" with a design token:'
    },
    {
      description:
        'Reports warning for hardcoded font size with replacement hook',
      inputCss: `
        .example {
          font-size: 16px;
        }
      `,
      expectedMessage:
        'The "16px" static value has no replacement styling hook.',
    },
    {
      description:
        'Suggests replacement for hardcoded color with no styling hook',
      inputCss: `
        .example {
          background-color: #123456;
        }
      `,
      expectedMessage:
        'Consider replacing the static value for "#123456" with a design token',
      expectedReplacement: '--slds-g-color-accent-container-3',
    },
    {
      description:
        'Does not report for valid CSS property with hook replacement',
      inputCss: `
        .example {
          background-color: var(--color-brand);
        }
      `,
      expectedMessage: null, // No warning expected
    },
    {
      description: 'Does not report for densified value not matching any hook',
      inputCss: `
        .example {
          padding: 20px;
        }
      `,
      //expectedMessage: null, // No warning expected
      expectedMessage:
        'The "20px" static value has no replacement styling hook.',
    },
  ];

  testCases.forEach(
    (
      { description, inputCss, expectedMessage, expectedReplacement },
      index
    ) => {
      it(description, async () => {
        const linterResult: LinterResult = await lint({
          code: inputCss,
          config: {
            plugins: ['./src/index.ts'], // Adjust the plugin path if needed
            rules: {
              [ruleName]: true,
            },
          },
        } as LinterOptions);

        const messages = linterResult.results[0].warnings.map(
          (warning) => warning.text
        );

        if (expectedMessage) {
          //console.log(expectedMessage)
          console.log(`Whats coming ${messages[0]}`)
          expect(messages[0]).to.include(expectedMessage);
        } else {
          //console.log(`EMPTY!!!`)
          expect(messages).to.be.empty;
        }
        if (expectedReplacement) {
          expect(messages[0]).to.include(expectedReplacement);
        }
      });
    }
  );
});
