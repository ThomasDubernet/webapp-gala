<?php

namespace App\Repository;

use App\Entity\CategorieTable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method CategorieTable|null find($id, $lockMode = null, $lockVersion = null)
 * @method CategorieTable|null findOneBy(array $criteria, array $orderBy = null)
 * @method CategorieTable[]    findAll()
 * @method CategorieTable[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CategorieTableRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategorieTable::class);
    }

    // /**
    //  * @return CategorieTable[] Returns an array of CategorieTable objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?CategorieTable
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
