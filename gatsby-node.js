const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const storyTemplate = path.resolve(`./src/templates/stories.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog stories pages.
  const stories = result.data.allMarkdownRemark.edges

  stories.forEach((story, index) => {
    const previous = index === stories.length - 1 ? null : stories[index + 1].node
    const next = index === 0 ? null : stories[index - 1].node

    createPage({
      path: story.node.fields.slug,
      component: storyTemplate,
      context: {
        slug: story.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
