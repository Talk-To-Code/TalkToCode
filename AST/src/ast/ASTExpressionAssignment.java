package ast;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for construction of AST Nodes that represents assignment expression
 * in C/Java and Python programs
 */
public class ASTExpressionAssignment extends ASTExpression{
	private static final String NODE_TYPE = "Assignment";
	//An assignment requires an object to be assigned to
	//An expression that represents the new value of the object
	//And the operator of the assignment (e.g =/+=/-= etc)
	private ASTExpression object;
	private ASTExpression exp;
	private ASTExpressionUnitOperator op;
	
	public ASTExpressionAssignment(){
		super();
	}
	public ASTExpressionAssignment(ASTExpression variable,ASTExpression exp,String operator){
		this();
		this.object = variable;
		this.exp = exp;
		this.op = new ASTExpressionUnitOperator(operator);
	
	}
	//code construction
	public String toSyntax(){
		this.result = this.object.toSyntax() + " "+this.op.toSyntax()+" "+this.exp.toSyntax();
		return super.toSyntax();
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public ASTExpression getObject(){
		return this.object;
	}
	public ASTExpression getExp(){
		return this.exp;
	}
}
