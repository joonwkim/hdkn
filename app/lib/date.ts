Date.prototype.toKrDateString = function (): string {
  return `${this.getFullYear()}.${(this.getMonth() + 1).toString().padStart(2, '0')}.${this.getDate().toString().padStart(2, '0')}`;
};
