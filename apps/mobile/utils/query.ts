import _ from "lodash";

const isInvalidValue = (value: any): boolean => {
  return (
    _.isNil(value) || // checks both null and undefined
    (_.isNumber(value) && _.isNaN(value)) ||
    (_.isString(value) && _.isEmpty(value)) ||
    (_.isString(value) && (value === "undefined" || value === "null")) // Check string 'undefined' and 'null'
  );
};

export const parseQueryParams = (params: Record<string, any>): string => {
  if (_.isEmpty(params) || !_.isPlainObject(params)) {
    return "";
  }

  const queryParts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    // Skip invalid values
    if (isInvalidValue(value)) {
      return;
    }

    // Handle arrays
    if (_.isArray(value)) {
      // Filter out invalid array elements
      const validElements = value.filter((element) => !isInvalidValue(element));

      validElements.forEach((element) => {
        queryParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(element)}`
        );
      });
    }
    // Handle primitive values (string, number, boolean)
    else if (!_.isPlainObject(value)) {
      queryParts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      );
    }
    // Skip objects (nested objects)
  });

  return queryParts.join("&");
};
