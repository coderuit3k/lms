/** Pure predicate — tách riêng khỏi app/learn/[lessonId]/actions.ts (toàn file đó là "use server",
 * export hàm sync non-async từ 1 file "use server" sẽ bị Next coi là Server Action không hợp lệ). */
export function shouldIssueCertificate(totalLessons: number, completedLessons: number): boolean {
  return totalLessons > 0 && completedLessons >= totalLessons;
}
