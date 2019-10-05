package ast;
import java.util.*;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that representing a new Object
 * constructor in Java and Python program
 *
 */
public class ASTExpressionUnitObjectConstructor extends ASTExpressionUnit {
	private static final String NODE_TYPE = "Object Constructor";
	protected ASTExpressionUnitTypes type;
	protected ArrayList<ASTExpression> parameters;
	public ASTExpressionUnitObjectConstructor(String type){
		super();
		this.type = new ASTExpressionUnitTypes(type);
		this.type.addParent(this);
		this.parameters = new ArrayList<ASTExpression>();
	}
	public void addParameter(ASTExpression exp){
		this.parameters.add(exp);
		exp.addParent(this);
	}
	//virtual method
	public String toSyntax(){
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
