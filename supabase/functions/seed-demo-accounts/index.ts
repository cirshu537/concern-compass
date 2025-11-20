import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoAccount {
  email: string
  password: string
  full_name: string
  role: string
  student_type: string
  branch: string | null
  program: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const demoAccounts: DemoAccount[] = [
      {
        email: 'adminmain@gmail.com',
        password: 'admin123',
        full_name: 'Main Admin',
        role: 'main_admin',
        student_type: 'none',
        branch: null,
        program: null
      },
      {
        email: 'adminkochi@gmail.com',
        password: 'admin123',
        full_name: 'Kochi Admin',
        role: 'branch_admin',
        student_type: 'none',
        branch: 'Kochi',
        program: null
      },
      {
        email: 'admincalicut@gmail.com',
        password: 'admin123',
        full_name: 'Calicut Admin',
        role: 'branch_admin',
        student_type: 'none',
        branch: 'Calicut - Kakkanchery',
        program: null
      },
      {
        email: 'admintvm@gmail.com',
        password: 'admin123',
        full_name: 'Trivandrum Admin',
        role: 'branch_admin',
        student_type: 'none',
        branch: 'Trivandrum',
        program: null
      },
      {
        email: 'trainer1kochi@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 1 Kochi',
        role: 'trainer',
        student_type: 'none',
        branch: 'Kochi',
        program: null
      },
      {
        email: 'trainer2kochi@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 2 Kochi',
        role: 'trainer',
        student_type: 'none',
        branch: 'Kochi',
        program: null
      },
      {
        email: 'trainer1calicut@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 1 Calicut',
        role: 'trainer',
        student_type: 'none',
        branch: 'Calicut - Kakkanchery',
        program: null
      },
      {
        email: 'trainer2calicut@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 2 Calicut',
        role: 'trainer',
        student_type: 'none',
        branch: 'Calicut - Kakkanchery',
        program: null
      },
      {
        email: 'trainer1tvm@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 1 Trivandrum',
        role: 'trainer',
        student_type: 'none',
        branch: 'Trivandrum',
        program: null
      },
      {
        email: 'trainer2tvm@gmail.com',
        password: 'trainer123',
        full_name: 'Trainer 2 Trivandrum',
        role: 'trainer',
        student_type: 'none',
        branch: 'Trivandrum',
        program: null
      },
      {
        email: 'traineronline@gmail.com',
        password: 'trainer123',
        full_name: 'Online Trainer',
        role: 'trainer',
        student_type: 'none',
        branch: 'Online',
        program: null
      },
      {
        email: 'staff1kochi@gmail.com',
        password: 'staff123',
        full_name: 'Staff 1 Kochi',
        role: 'staff',
        student_type: 'none',
        branch: 'Kochi',
        program: null
      },
      {
        email: 'staff2kochi@gmail.com',
        password: 'staff123',
        full_name: 'Staff 2 Kochi',
        role: 'staff',
        student_type: 'none',
        branch: 'Kochi',
        program: null
      },
      {
        email: 'staff1calicut@gmail.com',
        password: 'staff123',
        full_name: 'Staff 1 Calicut',
        role: 'staff',
        student_type: 'none',
        branch: 'Calicut - Kakkanchery',
        program: null
      },
      {
        email: 'staff2calicut@gmail.com',
        password: 'staff123',
        full_name: 'Staff 2 Calicut',
        role: 'staff',
        student_type: 'none',
        branch: 'Calicut - Kakkanchery',
        program: null
      },
      {
        email: 'staff1tvm@gmail.com',
        password: 'staff123',
        full_name: 'Staff 1 Trivandrum',
        role: 'staff',
        student_type: 'none',
        branch: 'Trivandrum',
        program: null
      },
      {
        email: 'staff2tvm@gmail.com',
        password: 'staff123',
        full_name: 'Staff 2 Trivandrum',
        role: 'staff',
        student_type: 'none',
        branch: 'Trivandrum',
        program: null
      },
      {
        email: 'staff1online@gmail.com',
        password: 'staff123',
        full_name: 'Staff 1 Online',
        role: 'staff',
        student_type: 'none',
        branch: 'Online',
        program: null
      },
      {
        email: 'staff2online@gmail.com',
        password: 'staff123',
        full_name: 'Staff 2 Online',
        role: 'staff',
        student_type: 'none',
        branch: 'Online',
        program: null
      }
    ]

    const results = []
    const errors = []

    for (const account of demoAccounts) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name,
            role: account.role,
            student_type: account.student_type
          }
        })

        if (error) {
          errors.push({ email: account.email, error: error.message })
        } else if (data.user) {
          await supabaseAdmin
            .from('profiles')
            .update({
              branch: account.branch,
              program: account.program
            })
            .eq('id', data.user.id)

          results.push({ email: account.email, success: true })
        }
      } catch (err) {
        errors.push({ email: account.email, error: String(err) })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: results.length,
        errors: errors.length,
        details: { results, errors }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
