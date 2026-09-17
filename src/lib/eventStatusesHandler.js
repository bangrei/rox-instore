import { storeService } from "@/bloc/services";
import moment from "moment-timezone";

export default {
  updateStatuses: async () => {
    try {
      let json = await storeService.retrieveBookings();
      if (!json.success) return;

      if (json.orders) {
        let now = parseInt(moment.tz(moment(), "Asia/Singapore").format("x"));
        json.orders
          .filter((it) => {
            let active = !["COMPLETED", "CANCELLED"].includes(it.status);
            let eventTimes = it.items
              .map((t) => {
                return t.ticket.endDate;
              })
              .sort((a, b) => {
                return b - a;
              });
            return active && eventTimes && now > eventTimes[0];
          })
          ?.forEach(async (it) => {
            await storeService.completeEvent(it.number);
          });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
