class TimeRangeUtil {
  static getDateRange(timeRange = "24h") {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { startDate, now };
  }

  static getGroupByFormat(timeRange) {
    switch (timeRange) {
      case "1h":
        return { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$createdAt" } };
      case "6h":
      case "24h":
        return { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
      case "7d":
      case "30d":
        return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      default:
        return { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
    }
  }

  static getGroupByDateOnlyFormat(timeRange) {
    switch (timeRange) {
      case "24h":
        return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      case "7d":
      case "30d":
        return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      default:
        return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }
  }

  static validateTimeRange(timeRange) {
    const valid = ["1h", "6h", "24h", "7d", "30d"];
    if (!timeRange || !valid.includes(timeRange)) {
      return "24h";
    }
    return timeRange;
  }
}

module.exports = TimeRangeUtil;
