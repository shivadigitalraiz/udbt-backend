// importing models
const userModel = require("../../model/user");
const userPostsModel = require("../../model/userPosts");
const { DateTime } = require("luxon");

exports.getDashboardata = async function (req, res) {
  try {
    //  graph monthly:
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    const istDateTime = DateTime.now().setZone("Asia/Kolkata");
    const logDate = istDateTime.toISO({ includeOffset: true });

    // total users
    const totalStartups = await userModel.countDocuments({
      isStartupOrInvestor: "startup",
      status: "active",
    });

    // total users
    const totalInvestors = await userModel.countDocuments({
      isStartupOrInvestor: "investor",
      status: "active",
    });

    const totalInvestorPosts = await userPostsModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isStartupOrInvestor": "investor",
          "userDetails.status": "active",
        },
      },
      {
        $count: "totalInvestorPosts",
      },
    ]);

    const userinvestcount =
      totalInvestorPosts.length > 0
        ? totalInvestorPosts[0].totalInvestorPosts
        : 0;

    console.log(`Total active investor posts: ${userinvestcount}`);

    const totalStartupPosts = await userPostsModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isStartupOrInvestor": "startup",
          "userDetails.status": "active",
        },
      },
      {
        $count: "totalInvestorPosts",
      },
    ]);

    const startupscount =
      totalStartupPosts.length > 0 ? totalStartupPosts[0].totalStartupPosts : 0;

    console.log(`Total active investor posts: ${startupscount}`);

    const latestStartups = await userModel.aggregate([
      {
        $match: {
          status: "active",
          isStartupOrInvestor: "startup",
        },
      },
      {
        $project: {
          userUniqueId: 1,
          fullNameorCompanyName: 1,
          about: 1,
          email: 1,
          phone: 1,
          logCreatedDate: 1,
          city: 1,
          founded: 1,
          valuation: 1,
          profilePic: 1,
          status: 1,
        },
      },
      {
        $sort: {
          logCreatedDate: -1, // Assuming 'createdAt' is the field that stores the creation date
        },
      },
      {
        $limit: 10,
      },
    ]);
    console.log(latestStartups);

    const latestinvestors = await userModel.aggregate([
      {
        $match: {
          status: "active",
          isStartupOrInvestor: "investor",
        },
      },
      {
        $project: {
          userUniqueId: 1,
          fullNameorCompanyName: 1,
          about: 1,
          email: 1,
          phone: 1,
          logCreatedDate: 1,
          city: 1,
          founded: 1,
          valuation: 1,
          profilePic: 1,
          status: 1,
          about: 1,
          bio: 1,
        },
      },
      {
        $sort: {
          logCreatedDate: -1, // Assuming 'createdAt' is the field that stores the creation date
        },
      },
      {
        $limit: 10,
      },
    ]);
    console.log(latestinvestors);

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    //monthly Investors
    const monthlyInvestors = await Promise.all(
      months.map(async (month) => {
        const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

        const startDate = new Date(`${year}-${month}-01`)
          .toISOString()
          .slice(0, 10); //+
        //"T00:00:00.000+05:30";
        // "T00:00:00.000Z";
        const endDate = new Date(
          `${year}-${month}-${new Date(year, month, 0).getDate()}`
        )
          .toISOString()
          .slice(0, 10); //+ "T23:23:23.999+05:30"; // "T23:59:59.999Z";

        let condition = {
          logCreatedDate: {
            $gte: startDate,
            $lt: endDate,
          },
          status: "active",
          isStartupOrInvestor: "investor",
        };
        console.log(condition);
        return await userModel.countDocuments(condition);
      })
    );

    console.log(
      "Montly users:--------------------------------",
      monthlyInvestors
    );

    //monthly Startups
    const monthlyStartups = await Promise.all(
      months.map(async (month) => {
        const year = new Date().getMonth() < month - 1 ? nextYear : currentYear;

        const startDate = new Date(`${year}-${month}-01`)
          .toISOString()
          .slice(0, 10); //+
        //"T00:00:00.000+05:30";
        // "T00:00:00.000Z";
        const endDate = new Date(
          `${year}-${month}-${new Date(year, month, 0).getDate()}`
        )
          .toISOString()
          .slice(0, 10); //+ "T23:23:23.999+05:30"; // "T23:59:59.999Z";

        let condition = {
          logCreatedDate: {
            $gte: startDate,
            $lt: endDate,
          },
          status: "active",
          isStartupOrInvestor: "investor",
        };
        console.log(condition);
        return await userModel.countDocuments(condition);
      })
    );

    console.log(
      "Montly users:--------------------------------",
      monthlyStartups
    );

    // Getting today's counts
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    ).toISOString();

    // Format today's date as 'YYYY-MM-DD'
    const todayString =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    const todayStartups = await userModel.countDocuments({
      logCreatedDate: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      status: "active",
      isStartupOrInvestor: "startup",
    });

    const todayInvestors = await userModel.countDocuments({
      logCreatedDate: {
        $gte: todayStart,
        $lt: todayEnd,
      },
      status: "active",
      isStartupOrInvestor: "investor",
    });

    const totalInvestorPostsToday = await userPostsModel.aggregate([
      {
        $match: {
          logCreatedDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      }, 
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isStartupOrInvestor": "investor",
          "userDetails.status": "active",
        },
      },
      {
        $count: "totalInvestorPostsToday",
      },
    ]);

    const todayinvestorCount =
      totalInvestorPostsToday.length > 0
        ? totalInvestorPostsToday[0].totalInvestorPostsToday
        : 0;

    console.log(`Total active investor posts for today: ${todayinvestorCount}`);

    const totalStartuprPostsToday = await userPostsModel.aggregate([
      {
        $match: {
          logCreatedDate: {
            $gte: todayStart,
            $lt: todayEnd,
          },
        },
      },
      {
        $lookup: {
          from: "users", // The users collection
          localField: "userId", // Field in userPosts collection
          foreignField: "_id", // Field in users collection
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $match: {
          "userDetails.isStartupOrInvestor": "investor",
          "userDetails.status": "active",
        },
      },
      {
        $count: "totalInvestorPostsToday",
      },
    ]);

    const todayStartupcount =
      totalStartuprPostsToday.length > 0
        ? totalStartuprPostsToday[0].totalStartuprPostsToday
        : 0;

    console.log(`Total active investor posts for today: ${todayStartupcount}`);

    return res.status(200).json({
      success: true,
      message: "Data retrived succes sfully",
      totalStartups,
      totalInvestors,
      //
      todayStartups,
      todayInvestors,
      //
      totalInvestorPosts: userinvestcount,
      totalStartupPosts: startupscount,
      //
      totalInvestorPostsToday: todayinvestorCount,
      totalStartuprPostsToday: todayStartupcount,

      //
      latestinvestors,
      latestStartups,
      //monthly
      monthlyInvestors,
      monthlyStartups,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Somthing went wrong" });
  }
};
