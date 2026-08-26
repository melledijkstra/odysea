import Root from './Tracker.svelte'
import Metric from './TrackerMetric.svelte'
import Title from './TrackerTitle.svelte'
import IconTitle from './TrackerIconTitle.svelte'
import Actions from './TrackerActions.svelte'
import ActionItem from './TrackerActionItem.svelte'

export const Tracker = {
  Root,
  Metric,
  Title,
  IconTitle,
  Actions,
  Action: {
    Item: ActionItem,
  },
}
