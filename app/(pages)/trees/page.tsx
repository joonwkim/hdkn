'use client'
import TreeView6 from '@/app/components/trees/treeView6'
import TreeView9 from '@/app/components/trees/treeView9'
import { treeData } from '@/app/seeds/treeData'
import React from 'react'

const TreePage = () => {
  return (
      <div className="row">
          <div className="col-4">
              <h4>TreeView 9</h4>
              <TreeView9 nodes={treeData} />
          </div>
          <div className="col-4">
              <h4>TreeView 6</h4>
              <TreeView6 nodes={treeData} />
          </div>
      </div>
  )
}

export default TreePage