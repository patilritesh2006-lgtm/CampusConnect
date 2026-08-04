const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");


// ====================== REGISTER ======================
const register = async (req, res) => {

    try {

        const {
            full_name,
            email,
            password,
            role
        } = req.body;


        if (!full_name || !email || !password) {

            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });

        }


        const existingUser = await prisma.users.findUnique({

            where:{
                email
            }

        });


        if(existingUser){

            return res.status(400).json({

                success:false,
                message:"Email already exists"

            });

        }


        const hashedPassword = await bcrypt.hash(password,10);


        const user = await prisma.users.create({

            data:{

                full_name,
                email,
                password:hashedPassword,
                role: role || "student"

            }

        });


        const {password:_, ...userData}=user;


        res.status(201).json({

            success:true,
            message:"User Registered Successfully",
            user:userData

        });


    } catch(error){

        console.log(error);

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};




// ====================== LOGIN ======================
const login = async(req,res)=>{

    try{

        const {
            email,
            password
        }=req.body;


        if(!email || !password){

            return res.status(400).json({

                success:false,
                message:"Email and Password required"

            });

        }



        const user = await prisma.users.findUnique({

            where:{
                email
            }

        });



        if(!user){

            return res.status(404).json({

                success:false,
                message:"User not found"

            });

        }



        const match = await bcrypt.compare(
            password,
            user.password
        );



        if(!match){

            return res.status(401).json({

                success:false,
                message:"Invalid Password"

            });

        }



        const token = jwt.sign(

            {
                id:user.id,
                email:user.email,
                role:user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );



        const {password:_, ...userData}=user;


        res.status(200).json({

            success:true,
            message:"Login Successful",
            token,
            user:userData

        });



    }catch(error){

        console.log(error);

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};



module.exports={
    register,
    login
};