export type CreateFormErrors = {
  title?: string;
  description?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  locationName?: string;
  activityCity?: string;
  groupSize?: string;
};

export type CreateFormInput = {
  title: string;
  description: string;
  categoryId: string | null;
  startDate: Date;
  endDate: Date | null;
  hasEndDate: boolean;
  locationName: string;
  activityCity: string;
  groupType: 'open_join' | 'need_one_person' | 'fixed_group';
  groupSize: string;
};

const TITLE_MIN = 3;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

export function validateCreateActivityForm(input: CreateFormInput): CreateFormErrors {
  const errors: CreateFormErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  const locationName = input.locationName.trim();
  const activityCity = input.activityCity.trim();

  if (!title) {
    errors.title = 'Give your plan a name people will notice.';
  } else if (title.length < TITLE_MIN) {
    errors.title = `Title needs at least ${TITLE_MIN} characters.`;
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  if (!description) {
    errors.description = 'Tell people what to expect.';
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!input.categoryId) {
    errors.categoryId = 'Pick a category for your plan.';
  }

  if (input.startDate.getTime() <= Date.now()) {
    errors.startDate = 'Your plan needs to start in the future.';
  }

  if (input.hasEndDate && input.endDate) {
    if (input.endDate.getTime() <= input.startDate.getTime()) {
      errors.endDate = 'End time must be after the start time.';
    }
  } else if (input.hasEndDate && !input.endDate) {
    errors.endDate = 'Pick an end time or turn this off.';
  }

  if (!locationName) {
    errors.locationName = 'Where should people meet you?';
  }

  if (!activityCity) {
    errors.activityCity = 'Add the city so people can find you.';
  }

  if (input.groupType === 'fixed_group' && input.groupSize.trim()) {
    const size = parseInt(input.groupSize, 10);
    if (Number.isNaN(size) || size < 2) {
      errors.groupSize = 'Fixed groups need at least 2 people.';
    }
  }

  return errors;
}

export function firstCreateFormErrorKey(errors: CreateFormErrors): keyof CreateFormErrors | null {
  const order: (keyof CreateFormErrors)[] = [
    'title',
    'description',
    'categoryId',
    'startDate',
    'endDate',
    'locationName',
    'activityCity',
    'groupSize',
  ];
  return order.find(key => errors[key]) ?? null;
}

export const CREATE_FORM_LIMITS = {
  titleMin: TITLE_MIN,
  titleMax: TITLE_MAX,
  descriptionMax: DESCRIPTION_MAX,
} as const;
