import { UserSchemas } from "../models/user.js";
import jwt from "jsonwebtoken"

const options = {
    secure: true,
    http: true,
}
const generateRefereshTokens = async(MetaHash) =>{
    try {
        const RefreshToken = jwt.sign({
            MetaHash
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
          })
        console.log(RefreshToken);
        
        // user.RefreshToken = RefreshToken
        // await user.save({ validateBeforeSave: false })

        return {RefreshToken}


    } catch (error) {
        res.status(500).send(error.toString());
    }
}

const getUserdetailsFromRefereshToken = async (RefreshToken) => {
    // if(!RefreshToken){
    //     return {
    //         message : "session out",
    //         logout : true,
    //     }
    // }

    console.log(RefreshToken)

    const decode = jwt.verify(RefreshToken,process.env.REFRESH_TOKEN_SECRET)
    console.log(decode);
    const user = await UserSchemas.find({MetaHash: decode.MetaHash}).select('-password')
    console.log(user);
    
    return user
}
export const getUserDetails = async (req, res) => {
    try {
        // Check if cookies are present in the request
        const cookies = req.headers.cookie;
        
        if (cookies) {
            // Extract the RefreshToken from the cookies
            const cookieArray = cookies.split(';');
            let refreshToken;
            
            cookieArray.forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                if (key === 'RefreshToken') {
                    refreshToken = value;
                }
            });
            
            if (!refreshToken) {
                return res.status(404).json({ message: "No token provided" });
            }
            
            // Fetch user details using the refresh token
            const user = await getUserdetailsFromRefereshToken(refreshToken);
            console.log("user", user);

            if (!user) {
                return res.status(201).json({ message: "Token expired or invalid" });
            }
            
            // Respond with user details and refresh token
            res.status(200).json({ user, refreshToken });

        } else {
            res.status(204).json({ message: "No cookies found" });
        }

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error getting user details:", error);

        // Respond with a generic error message
        res.status(500).json({ message: "Internal server error", error: error.toString() });
    }
};

// export const getUserDetails = async (req, res) => {
//     try {
//         if (req.headers.cookie) {

//             let RefreshToken = req.headers.cookie.replace("RefreshToken=", "");
//         const user = await getUserdetailsFromRefereshToken(RefreshToken)
//         console.log("user",user);
//         if (!user) {
//             return res.status(401).json({
//                 message: "Token expired"
//             })
//         }
//         res.status(200).json({user,RefreshToken});
//         } else {
//             res.status(404).json({
//                 message: "No token provided"
//             })
            
//         }
        

//     } catch (error) {
//         res.status(500).send(error.toString());
//     }
// }
export const login = async (req, res) => {
    const { MetaHash } = req.body;
    try {
        if (!MetaHash) {
            res.status(204).send("User not found");
        } else {
            
            const checkuser = await UserSchemas.find({MetaHash})
            
            if(checkuser[0]){
                 console.log("User found");
                const {RefreshToken} = await generateRefereshTokens(MetaHash)
                 res.status(200).cookie("RefreshToken",RefreshToken,options).json({checkuser,RefreshToken});
            }else{
                console.log("user not found")
                res.status(204).json({
                    message: "User not found"
                })
            }
        }
      } catch (error) {
        res.status(500).send(error.toString());
      } 
}

export const logout = async (req, res) => {             
    res.status(200).clearCookie("RefreshToken").send();
}

export const register = async (req, res) => {
    const { Name,Email,MetaHash,BgImage_URL,MainImage_URL,Description } = req.body;

    try {
        const user = await UserSchemas.create({ Name,Email,MetaHash,BgImage_URL,MainImage_URL,Description });
        console.log("User created",user);
        const {RefreshToken} = await generateRefereshTokens(user.MetaHash)
        console.log("RefreshToken",RefreshToken);
        
        res.status(200).cookie("RefreshToken",RefreshToken,options).send(user);
    } catch (error) {
        res.status(500).send(error.toString());
    }
}

export const updateUser = async (req, res) => {
    const { _id } = req.params;
    const { Name,BgImage_URL,MainImage_URL,Description, } = req.body;
    console.log(Name,BgImage_URL,MainImage_URL,Description,_id);
    
    try {
        const updateUser = await UserSchemas.findByIdAndUpdate(_id, {Name,BgImage_URL,MainImage_URL,Description});
        const updatedUser = await UserSchemas.findById(updateUser._id)
        console.log(updatedUser);

        
        res.status(200).json({updatedUser,
            success:true
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }
};

