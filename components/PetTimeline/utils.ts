import { IReminder, IReminderGroup } from "@/interfaces";

export function groupDataByPetId(data: IReminder[]) {
  // Create a map to store pet groups
  const petGroups = new Map<string, IReminderGroup>();

  // Iterate through each date group
  data.forEach((dateGroup) => {
    // Iterate through each activity in the date group
    dateGroup.data.forEach((activity) => {
      const { petId } = activity;

      // Get or create pet group
      if (!petGroups.has(petId)) {
        petGroups.set(petId, {
          petId,
          data: [],
        });
      }

      const petGroup = petGroups.get(petId)!;

      // Find existing date group or create new one
      let existingDateGroup = petGroup.data.find(
        (group) => group.title === dateGroup.title
      );

      if (!existingDateGroup) {
        existingDateGroup = {
          title: dateGroup.title,
          data: [],
        };
        petGroup.data.push(existingDateGroup);
      }

      // Add activity to the date group
      existingDateGroup.data.push(activity);
    });
  });

  return Array.from(petGroups.values());
}
