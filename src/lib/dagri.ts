export function getParentCode(code: string) {
  let parentCodeLength = 0;
  if (code.length === 5)
    parentCodeLength = 2;
  else if (code.length === 8)
    parentCodeLength = 5;
  else if (code.length === 13)
    parentCodeLength = 8;

  return code.substr(0, parentCodeLength);
}