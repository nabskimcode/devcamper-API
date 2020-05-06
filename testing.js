



// x1 = 0, y1 = 2
// x2 = 2, y2 = 1
// the first object will move from 0 and follow by 2, 4, 6, 8...
// the second object will move from 2 and follow by 3, 4, 5, 6...
// they met at 4, so the result should be true.

// example 2:
// x1 = 0, y1 = 2
// x2 = 3, y2 = 1
// the first object will move from 0 and follow by




// function canObjectsMeet(x1,x2,y1,y2) {
//     var ar1 = []
//     var ar2 = []
   
//   while(x1 != 8){
//     x1 = x1 + y1
//     x2 = x2 + y2
//     ar1.push(x1)
//     ar2.push(x2)
//   // console.log('x2', x2)
// }   
// checkIndex(ar1,ar2)
// // arraysEqual(ar1,ar2)

// }


// function checkIndex(ar1,ar2) {
//     // for(let i = 0; i < ar1.length ; i++) {
//         // console.log('ar1',ar1)
//         for(let j = 0; j < ar2.length ; j++){
//             // console.log('ar1',ar1[j])
//             // console.log('ar2',ar2[j])
//             if(ar1[j] === ar2[j] ) {
//                 let adad = ar1[j] === ar2[j]
//                 console.log(adad)
//                 break
//                 } else {
//                     console.log('false')
//                 }
            
//          }
    
//     //  }
// }
//     // var intersections = ar1.find(e => ar2.indexOf(e) !== -1);
//     // console.log(intersections)
//     // if(intersections){
//     //     return true
//     // } else {
//     //     return false
//     // }
   
// //}

// // function arraysEqual(a, b) {
// //     // console.log(a)
// //     for (var i = 0; i < a.length; ++i) {
// //       if (a[i] !== b[i]) return false;
// //       console.log('False')
// //     }
// //     console.log('True')
// //     return true;
// //   }

// canObjectsMeet(0,3,2,1)


function canObjectsMeet(x1,x2,y1,y2) {
    var ar1 = []
    var ar2 = []
    
  while(x1 != 8){
    x1 = x1 + y1
    x2 = x2 + y2
    ar1.push(x1)
    ar2.push(x2)
}   
checkIndex(ar1,ar2)
}

function checkIndex(ar1,ar2) {
    var result = []
        for(let j = 0; j < ar2.length ; j++){
            if(ar1[j] === ar2[j] ) {
                let adad = ar1[j] === ar2[j]
                console.log(adad)
                result.push( ar1[j] );
                break
                } else {
                    console.log('false')
                }
            
         }
    console.log(result)
    //  }
}

canObjectsMeet(0,3,2,1)