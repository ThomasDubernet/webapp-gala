<?php

namespace App\Repository;

use App\Entity\CategoriePersonne;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method CategoriePersonne|null find($id, $lockMode = null, $lockVersion = null)
 * @method CategoriePersonne|null findOneBy(array $criteria, array $orderBy = null)
 * @method CategoriePersonne[]    findAll()
 * @method CategoriePersonne[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CategoriePersonneRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategoriePersonne::class);
    }

    // /**
    //  * @return CategoriePersonne[] Returns an array of CategoriePersonne objects
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
    public function findOneBySomeField($value): ?CategoriePersonne
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
