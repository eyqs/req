export interface ReqLeaf {
    code: string;               // course id, no spaces allowed, x. 'CPSC314'
}

export interface ReqNode {
    operator: string;                   // operator to apply, x. 'or'
    children?: (ReqLeaf | ReqNode)[];   // children on which to apply operator
}

export type ReqTree = ReqLeaf | ReqNode

export interface Course {
    school: string;             // school id, must match parser, x. 'ubc'
    code: string;               // course id, no spaces allowed, x. 'CPSC314'
    name?: string;              // course name, x. 'Computer Graphics'
    term?: string;              // term when data was scraped, x. '2018W2'
    description?: string;       // x. 'Human vision and colour; geometric...'
    preq_string?: string;       // x. 'One of MATH 200, MATH 217, MATH 226...'
    creq_string?: string;       // x. 'Either (a) CPSC 221 or (b) all of...'
    excl_string?: string;       // x. 'Not for credit for students who...'
    credit_set?: number[];      // possible number of credits, x. {3.0, 6.0}
    preq_tree?: ReqTree;        // boolean expression tree for prerequisites
    creq_tree?: ReqTree;        // boolean expression tree for corequisites
    excl_tree?: ReqTree;        // boolean expression tree for exclusions
}
