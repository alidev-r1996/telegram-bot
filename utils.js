 function PersianDate(date) {
  return new Date(date).toLocaleDateString("fa-IR");
}

 function PersianCurrency(currency) {
  return parseInt(currency).toLocaleString("fa-IR") + ' ' + 'تومان';
}

 function PersianNumber(number) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(number).replace(/[0-9]/g, (digit) => persianDigits[+digit]);
}

module.exports = {
  PersianDate,
  PersianCurrency,
  PersianNumber,
};
