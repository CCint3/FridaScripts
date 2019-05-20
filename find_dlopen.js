var resolver = new ApiResolver('module');
resolver.enumerateMatches('exports:*!*dlopen*', {
  onMatch: function (match) {
    console.log(match.name + ": " + match.address);
  },
  onComplete: function () {
  }
});