import { Root } from 'postcss';
import stylelint, { Rule, RuleContext, PostcssResult } from 'stylelint';
import { Options } from './option.interface';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';

const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName:string = 'slds/no-slds-private-var';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: (prop: string) =>
    replacePlaceholders(errorMsg,{prop}),
});

function validateOptions(result: PostcssResult, options: Options) {
  return stylelint.utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(
  primaryOptions: Options,
  secondaryOptions: Options,
  context: RuleContext
) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      const severity =
                      result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"
      root.walkDecls((decl) => {
        if (decl.prop.startsWith('--_slds-')) {
          stylelint.utils.report({
            message: messages.expected(decl.prop),
            node: decl,
            result,
            ruleName,
            severity
          });

          // Optional: Call the fix method if in fixing context
          if (result.stylelint.config.fix) {
            fix(decl);
          }
        }
      });
    }
  };
}

// Implement the fix method
function fix(decl: any): void {
  // Modify the declaration as needed, e.g., remove the deprecated variable or correct it
  decl.prop = decl.prop.replace('--_slds-', '--slds-');
}

export default createPlugin(ruleName, rule as unknown as Rule);
