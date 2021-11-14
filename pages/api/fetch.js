import faunadb, { query as q } from 'faunadb'

const { FAUNADB_SECRET: secret } = process.env

const client = new faunadb.Client({ secret })

export default async function handler(req, res) {
  

    const { data} = await client.query(
        q.Map(
            q.Paginate(
                q.Range(
                    q.Match(q.Index('all_items')),
                    q.TimeSubtract(q.Now(), 1, "days"),
                    q.Now()
                ),
                {
                    size: 1000
                }
            ),
            q.Lambda((time, ref) => q.Get(ref))
        )
    )

    const formatted = data.map(item => item.data)

    res.status(200).json({ data: formatted})
}

