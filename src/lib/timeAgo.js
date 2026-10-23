import moment from "moment";

export default function timeAgo(value) {
  if (!value) return "";
  return moment(value).fromNow();
}