import faunadb, { query as q } from 'faunadb'

const { FAUNA_ADMIN_KEY: secret } = process.env

const client = new faunadb.Client({ secret })

export default async function handler(req, res) {
    const { data } = await client.query(
        q.Map(
            q.Paginate(
                q.Range(
                    q.Match(q.Index('items')),
                    q.Now(),
                    q.TimeSubtract(q.Now(), 5, "days")
              
                ),
                {
                    size: 3000
                }
            ),
            q.Lambda((time, ref) => q.Get(ref))
        )
    )

    const formatted = data.map(item => item.data)

    res.status(200).json({ data: formatted})
}

