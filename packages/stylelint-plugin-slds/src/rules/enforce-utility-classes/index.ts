import stylelint, { Rule, PostcssResult } from 'stylelint';
import { Root } from 'postcss';
import fs from 'fs';
import generateTable from '../../utils/generateTable';
import CSSClassMatcher from './utility-classes-cache';
import { metadataFileUrl } from '../../utils/metaDataFileUrl';
import ruleMetadata from '../../utils/rulesMetadata';
import replacePlaceholders from '../../utils/util';
const { utils, createPlugin }: typeof stylelint = stylelint;

const ruleName:string = 'slds/enforce-utility-classes';

const { severityLevel = 'error', warningMsg = '', errorMsg = '', ruleDesc = 'No description provided' } = ruleMetadata(ruleName) || {};

// Load the predefined classes from a JSON file
const jsonFilePath = metadataFileUrl('./public/metadata/utilities.json');
const predefinedClasses = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Helper function to normalize property values (trim and lowercase)
function normalizeValue(value: string): string {
  return value.trim().replace(/['"]+/g, '').toLowerCase();
}

function validateOptions(result: PostcssResult, options: any): boolean {
  return utils.validateOptions(result, ruleName, {
    actual: options,
    possible: {}, // Customize as needed
  });
}

function rule(primaryOptions?: any) {
  return (root: Root, result: PostcssResult) => {
    if (validateOptions(result, primaryOptions)) {
      root.walkRules((rule) => {
        const declarations =
          rule.nodes?.filter((node) => node.type === 'decl') || [];

        const matchedClasses = [];
        const matcher = new CSSClassMatcher(predefinedClasses);
        const exactMatchingClass = matcher.findMatchFromNodes(declarations);
        const severity =
              result.stylelint.config.rules[ruleName]?.[1] || severityLevel; // Default to "error"

        if (exactMatchingClass) {
          matchedClasses.push({ name: exactMatchingClass });
        }

        // If there are matched classes, report them in a table format
        if (matchedClasses.length > 0) {
          const table = generateTable(matchedClasses);

          utils.report({
            message: replacePlaceholders(errorMsg,{table}),
            node: rule,
            result,
            ruleName,
            severity
          });
        }
      });
    }
  };
}

export default createPlugin(ruleName, rule as unknown as Rule);
