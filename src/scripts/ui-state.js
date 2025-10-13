export const GalleryState = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  EMPTY: 'empty',
  ERROR: 'error'
});

export const StatusType = Object.freeze({
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
});

export function createLoadingState(message = 'Loading podcasts…') {
  return {
    status: GalleryState.LOADING,
    podcasts: [],
    message: {
      type: StatusType.INFO,
      title: 'Fetching gallery',
      body: message
    }
  };
}

export function createReadyState(podcasts) {
  return {
    status: GalleryState.READY,
    podcasts,
    message: {
      type: StatusType.SUCCESS,
      title: 'Gallery ready',
      body: `Loaded ${podcasts.length} podcast${podcasts.length === 1 ? '' : 's'}.`
    }
  };
}

export function createEmptyState() {
  return {
    status: GalleryState.EMPTY,
    podcasts: [],
    message: {
      type: StatusType.WARNING,
      title: 'No podcasts to show',
      body: 'Update your curated list to populate the gallery.'
    }
  };
}

function formatErrorDetails(error) {
  if (!error) {
    return {
      title: 'Something went wrong',
      body: 'We could not load podcasts. Please try again soon.'
    };
  }

  if (error.status === 404) {
    return {
      title: 'Podcast not found',
      body: 'One or more podcast entries could not be located in NeoDB.'
    };
  }

  if (error.status === 429) {
    return {
      title: 'Rate limited by NeoDB',
      body: 'NeoDB asked us to slow down. Please retry in a minute.'
    };
  }

  if (error.status >= 500) {
    return {
      title: 'NeoDB is unavailable',
      body: 'NeoDB is responding slowly. Try refreshing shortly.'
    };
  }

  return {
    title: 'Unable to load podcasts',
    body: error.message ?? 'Unexpected error occurred while contacting NeoDB.'
  };
}

export function createErrorState(error) {
  const details = formatErrorDetails(error);
  return {
    status: GalleryState.ERROR,
    podcasts: [],
    message: {
      type: StatusType.ERROR,
      title: details.title,
      body: details.body,
      error
    }
  };
}

export function selectStatusCopy(state) {
  if (!state || !state.message) {
    return { title: '', body: '' };
  }
  return state.message;
}
